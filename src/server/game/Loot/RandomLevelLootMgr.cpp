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
#include "ItemTemplate.h"
#include "Log.h"
#include "LootMgr.h"
#include "ObjectMgr.h"
#include "Player.h"
#include "Random.h"
#include "Timer.h"
#include "World.h"

RandomLevelLootMgr* RandomLevelLootMgr::instance()
{
    static RandomLevelLootMgr instance;
    return &instance;
}

uint32 RandomLevelLootMgr::GetItemLevelForPool(ItemTemplate const& proto, LevelMode mode)
{
    switch (mode)
    {
        case LEVEL_MODE_ITEM_LEVEL:
            return proto.ItemLevel;
        case LEVEL_MODE_REQUIRED_LEVEL:
            return proto.RequiredLevel;
        case LEVEL_MODE_REQUIRED_OR_ITEM:
        default:
            return proto.RequiredLevel > 0 ? proto.RequiredLevel : proto.ItemLevel;
    }
}

bool RandomLevelLootMgr::IsEligibleItem(ItemTemplate const& proto)
{
    // Tuning point: restrict the pool here (quality, class, bonding, blacklists, ...).
    if (proto.HasFlag(ITEM_FLAG_DEPRECATED))
        return false;

    return true;
}

bool RandomLevelLootMgr::IsEligibleCreature(Creature const* creature)
{
    if (!creature)
        return false;

    // Only creatures that would normally drop something.
    if (!creature->GetCreatureTemplate()->lootid)
        return false;

    if (creature->IsCritter() || creature->IsPet() || creature->IsTotem() || creature->IsTrigger())
        return false;

    return true;
}

void RandomLevelLootMgr::LoadItemPool()
{
    uint32 oldMSTime = getMSTime();

    _itemsByLevel.clear();

    if (!sWorld->getBoolConfig(CONFIG_RANDOM_LEVEL_LOOT_ENABLE))
    {
        LOG_INFO("server.loading", ">> Random level loot is disabled.");
        LOG_INFO("server.loading", " ");
        return;
    }

    LevelMode const mode = static_cast<LevelMode>(sWorld->getIntConfig(CONFIG_RANDOM_LEVEL_LOOT_LEVEL_MODE));

    uint32 count = 0;
    for (auto const& [itemId, proto] : *sObjectMgr->GetItemTemplateStore())
    {
        if (!IsEligibleItem(proto))
            continue;

        uint32 level = GetItemLevelForPool(proto, mode);
        if (!level)
            continue;

        if (level >= _itemsByLevel.size())
            _itemsByLevel.resize(level + 1);

        _itemsByLevel[level].push_back(itemId);
        ++count;
    }

    LOG_INFO("server.loading", ">> Loaded {} random level loot items across {} levels in {} ms", count, _itemsByLevel.size(), GetMSTimeDiffToNow(oldMSTime));
    LOG_INFO("server.loading", " ");
}

uint32 RandomLevelLootMgr::RollItemId(uint8 playerLevel) const
{
    if (!playerLevel || _itemsByLevel.empty())
        return 0;

    uint32 const levelsBelow = sWorld->getIntConfig(CONFIG_RANDOM_LEVEL_LOOT_LEVELS_BELOW);
    uint32 const maxLevel = std::min<uint32>(playerLevel, _itemsByLevel.size() - 1);
    uint32 const minLevel = levelsBelow >= playerLevel ? 1 : playerLevel - levelsBelow;

    if (minLevel > maxLevel)
        return 0;

    // Uniform pick over every item in [minLevel, maxLevel].
    uint32 total = 0;
    for (uint32 level = minLevel; level <= maxLevel; ++level)
        total += _itemsByLevel[level].size();

    if (!total)
        return 0;

    uint32 index = urand(0, total - 1);
    for (uint32 level = minLevel; level <= maxLevel; ++level)
    {
        std::vector<uint32> const& bucket = _itemsByLevel[level];
        if (index < bucket.size())
            return bucket[index];

        index -= bucket.size();
    }

    return 0;
}

void RandomLevelLootMgr::AddRandomItem(Loot& loot, Creature const* creature, Player const* looter) const
{
    if (!sWorld->getBoolConfig(CONFIG_RANDOM_LEVEL_LOOT_ENABLE) || !looter)
        return;

    if (!IsEligibleCreature(creature))
        return;

    if (!roll_chance_f(sWorld->getFloatConfig(CONFIG_RANDOM_LEVEL_LOOT_CHANCE)))
        return;

    uint32 itemId = RollItemId(looter->GetLevel());
    if (!itemId)
        return;

    LootStoreItem storeItem(itemId, 0, 100.0f, false, LOOT_MODE_DEFAULT, 0, 1, 1);
    loot.AddItem(storeItem);

    LOG_DEBUG("loot", "RandomLevelLoot: added item {} to loot of creature {} for player {} (level {})",
        itemId, creature->GetEntry(), looter->GetName(), looter->GetLevel());
}
