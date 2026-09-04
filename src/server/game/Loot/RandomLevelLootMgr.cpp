/*
 * This file is part of the AzerothCore Project. See AUTHORS file for Copyright information
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

#include "RandomLevelLootMgr.h"
#include "Creature.h"
#include "Group.h"
#include "ItemTemplate.h"
#include "Log.h"
#include "LootMgr.h"
#include "ObjectMgr.h"
#include "Player.h"
#include "Random.h"
#include "SharedDefines.h"
#include "Timer.h"
#include "Util.h"
#include "World.h"
#include <algorithm>
#include <cctype>

RandomLevelLootMgr* RandomLevelLootMgr::instance()
{
    static RandomLevelLootMgr instance;
    return &instance;
}

RandomLevelLootMgr::Tier RandomLevelLootMgr::GetTierForQuality(uint32 quality)
{
    switch (quality)
    {
        case ITEM_QUALITY_POOR:
        case ITEM_QUALITY_NORMAL:
        case ITEM_QUALITY_UNCOMMON:
            return TIER_COMMON;
        case ITEM_QUALITY_RARE:
            return TIER_RARE;
        case ITEM_QUALITY_EPIC:
            return TIER_EPIC;
        default:
            // Legendary, artifact and heirloom items never drop.
            return TIER_MAX;
    }
}

bool RandomLevelLootMgr::IsJunkName(std::string const& name)
{
    std::string lower = name;
    std::transform(lower.begin(), lower.end(), lower.begin(), charToLower);

    // Names of items that exist in the template store but are not meant to reach players.
    static constexpr std::array<char const*, 9> junkMarkers =
    {
        "test", "deprecated", "npc equip", "monster - ", "[ph]", "unused", "(dnd)", "debug", "qa "
    };

    for (char const* marker : junkMarkers)
        if (lower.find(marker) != std::string::npos)
            return true;

    // Test items are frequently named after their stat budget, e.g. "1300 Test Dagger 63 blue".
    return !lower.empty() && std::isdigit(static_cast<unsigned char>(lower[0]));
}

bool RandomLevelLootMgr::HasCommonRestrictions(ItemTemplate const& proto)
{
    // The level window is keyed on RequiredLevel, items without one cannot be placed.
    if (!proto.RequiredLevel)
        return true;

    // No quest rewards, quest starters or items that need a skill, spell, reputation or rank to use.
    if (proto.Bonding == BIND_QUEST_ITEM || proto.StartQuest)
        return true;

    if (proto.RequiredSkill || proto.RequiredSpell || proto.RequiredReputationFaction || proto.RequiredHonorRank || proto.RequiredCityRank)
        return true;

    if (proto.HasFlag(ITEM_FLAG_DEPRECATED))
        return true;

    return IsJunkName(proto.Name1);
}

bool RandomLevelLootMgr::IsEligiblePotion(ItemTemplate const& proto)
{
    if (!proto.IsPotion())
        return false;

    // Conjured potions vanish on logout and come from mages, not from loot.
    if (proto.HasFlag(ITEM_FLAG_CONJURED))
        return false;

    return !HasCommonRestrictions(proto);
}

bool RandomLevelLootMgr::IsEligibleItem(ItemTemplate const& proto)
{
    // Only gear the player can put on.
    if (proto.Class != ITEM_CLASS_WEAPON && proto.Class != ITEM_CLASS_ARMOR)
        return false;

    if (proto.InventoryType == INVTYPE_NON_EQUIP)
        return false;

    if (proto.Quality < sWorld->getIntConfig(CONFIG_RANDOM_LEVEL_LOOT_MIN_QUALITY))
        return false;

    if (GetTierForQuality(proto.Quality) == TIER_MAX)
        return false;

    // No set pieces (tier and dungeon sets) and no top end gear.
    if (proto.ItemSet)
        return false;

    uint32 const maxItemLevel = sWorld->getIntConfig(CONFIG_RANDOM_LEVEL_LOOT_MAX_ITEM_LEVEL);
    if (maxItemLevel && proto.ItemLevel > maxItemLevel)
        return false;

    return !HasCommonRestrictions(proto);
}

bool RandomLevelLootMgr::IsUsableByPlayer(ItemTemplate const& proto, Player const* looter)
{
    return (proto.AllowableClass & looter->getClassMask()) && (proto.AllowableRace & looter->getRaceMask());
}

bool RandomLevelLootMgr::IsEligibleCreature(Creature const* creature)
{
    if (!creature)
        return false;

    // Only creatures that would normally drop something.
    if (!creature->GetCreatureTemplate()->lootid)
        return false;

    return !creature->IsCritter() && !creature->IsPet() && !creature->IsTotem() && !creature->IsTrigger();
}

uint8 RandomLevelLootMgr::GetReferenceLevel(Creature const* creature, Player const* looter)
{
    // Lowest group member in loot range decides, so a low level player cannot be carried to high level items.
    uint8 level = looter->GetLevel();
    if (Group const* group = looter->GetGroup())
        for (GroupReference const* itr = group->GetFirstMember(); itr != nullptr; itr = itr->next())
            if (Player const* member = itr->GetSource())
                if (member->IsAtLootRewardDistance(creature))
                    level = std::min(level, member->GetLevel());

    // The creature's level caps it too, so a high level player cannot farm low level creatures for high level items.
    return std::min(level, creature->GetLevel());
}

void RandomLevelLootMgr::LoadItemPool()
{
    uint32 oldMSTime = getMSTime();

    _pool.clear();
    _potions.clear();

    if (!sWorld->getBoolConfig(CONFIG_RANDOM_LEVEL_LOOT_ENABLE))
    {
        LOG_INFO("server.loading", ">> Random level loot is disabled.");
        LOG_INFO("server.loading", " ");
        return;
    }

    std::array<uint32, TIER_MAX> counts = {};
    uint32 potionCount = 0;
    for (auto const& [itemId, proto] : *sObjectMgr->GetItemTemplateStore())
    {
        if (IsEligiblePotion(proto))
        {
            if (proto.RequiredLevel >= _potions.size())
                _potions.resize(proto.RequiredLevel + 1);

            _potions[proto.RequiredLevel].push_back(itemId);
            ++potionCount;
            continue;
        }

        if (!IsEligibleItem(proto))
            continue;

        Tier tier = GetTierForQuality(proto.Quality);
        uint32 level = proto.RequiredLevel;

        if (level >= _pool.size())
            _pool.resize(level + 1);

        _pool[level][tier].push_back(itemId);
        ++counts[tier];
    }

    LOG_INFO("server.loading", ">> Loaded {} common, {} rare and {} epic random level loot items across {} levels and {} potions in {} ms",
        counts[TIER_COMMON], counts[TIER_RARE], counts[TIER_EPIC], _pool.size(), potionCount, GetMSTimeDiffToNow(oldMSTime));
    LOG_INFO("server.loading", " ");
}

RandomLevelLootMgr::Tier RandomLevelLootMgr::RollTier()
{
    // Every tier is rolled on its own and the best one that succeeds wins.
    if (roll_chance_f(sWorld->getFloatConfig(CONFIG_RANDOM_LEVEL_LOOT_CHANCE_EPIC)))
        return TIER_EPIC;

    if (roll_chance_f(sWorld->getFloatConfig(CONFIG_RANDOM_LEVEL_LOOT_CHANCE_RARE)))
        return TIER_RARE;

    if (roll_chance_f(sWorld->getFloatConfig(CONFIG_RANDOM_LEVEL_LOOT_CHANCE_COMMON)))
        return TIER_COMMON;

    return TIER_MAX;
}

template<typename BucketForLevel>
uint32 RandomLevelLootMgr::PickFromWindow(Player const* looter, uint8 referenceLevel, uint32 levelsBelow, std::size_t poolSize, BucketForLevel bucketForLevel)
{
    if (!looter || !referenceLevel || !poolSize)
        return 0;

    uint32 const maxLevel = std::min<uint32>(referenceLevel, poolSize - 1);
    uint32 const minLevel = levelsBelow >= referenceLevel ? 1 : referenceLevel - levelsBelow;

    if (minLevel > maxLevel)
        return 0;

    // Collect, per level, the items the looter can use. Buckets are small so this is cheap per kill.
    LevelBuckets candidatesByLevel;
    for (uint32 level = minLevel; level <= maxLevel; ++level)
    {
        std::vector<uint32> candidates;
        for (uint32 itemId : bucketForLevel(level))
        {
            ItemTemplate const* proto = sObjectMgr->GetItemTemplate(itemId);
            if (proto && IsUsableByPlayer(*proto, looter))
                candidates.push_back(itemId);
        }

        if (!candidates.empty())
            candidatesByLevel.push_back(std::move(candidates));
    }

    if (candidatesByLevel.empty())
        return 0;

    // Pick the level first so every level in the window is equally likely, regardless of how many items it has.
    std::vector<uint32> const& bucket = candidatesByLevel[urand(0, candidatesByLevel.size() - 1)];
    return bucket[urand(0, bucket.size() - 1)];
}

uint32 RandomLevelLootMgr::RollItemId(Player const* looter, uint8 referenceLevel, Tier tier) const
{
    if (tier >= TIER_MAX)
        return 0;

    return PickFromWindow(looter, referenceLevel, sWorld->getIntConfig(CONFIG_RANDOM_LEVEL_LOOT_LEVELS_BELOW), _pool.size(),
        [this, tier](uint32 level) -> std::vector<uint32> const& { return _pool[level][tier]; });
}

uint32 RandomLevelLootMgr::RollPotionId(Player const* looter, uint8 referenceLevel) const
{
    return PickFromWindow(looter, referenceLevel, sWorld->getIntConfig(CONFIG_RANDOM_LEVEL_LOOT_POTION_LEVELS_BELOW), _potions.size(),
        [this](uint32 level) -> std::vector<uint32> const& { return _potions[level]; });
}

void RandomLevelLootMgr::AddRandomItem(Loot& loot, Creature const* creature, Player const* looter) const
{
    if (!sWorld->getBoolConfig(CONFIG_RANDOM_LEVEL_LOOT_ENABLE))
        return;

    if (!looter || !IsEligibleCreature(creature))
        return;

    uint8 const referenceLevel = GetReferenceLevel(creature, looter);

    // Gear: best successful tier wins, at most one item.
    Tier tier = RollTier();
    if (tier < TIER_MAX)
    {
        if (uint32 itemId = RollItemId(looter, referenceLevel, tier))
        {
            LootStoreItem storeItem(itemId, 0, 100.0f, false, LOOT_MODE_DEFAULT, 0, 1, 1);
            loot.AddItem(storeItem);

            LOG_DEBUG("loot", "RandomLevelLoot: added item {} (tier {}) to loot of creature {} for player {} (reference level {})",
                itemId, uint32(tier), creature->GetEntry(), looter->GetName(), referenceLevel);
        }
    }

    // Potion: independent roll, at most one potion.
    if (roll_chance_f(sWorld->getFloatConfig(CONFIG_RANDOM_LEVEL_LOOT_POTION_CHANCE)))
    {
        if (uint32 potionId = RollPotionId(looter, referenceLevel))
        {
            LootStoreItem storeItem(potionId, 0, 100.0f, false, LOOT_MODE_DEFAULT, 0, 1, 1);
            loot.AddItem(storeItem);

            LOG_DEBUG("loot", "RandomLevelLoot: added potion {} to loot of creature {} for player {} (reference level {})",
                potionId, creature->GetEntry(), looter->GetName(), referenceLevel);
        }
    }
}
