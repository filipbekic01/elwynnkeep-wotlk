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

#ifndef ACORE_RANDOM_LEVEL_LOOT_MGR_H
#define ACORE_RANDOM_LEVEL_LOOT_MGR_H

#include "Define.h"
#include <array>
#include <string>
#include <vector>

class Creature;
class Player;
struct ItemTemplate;
struct Loot;

/**
 * Custom system: every lootable creature kill may drop one extra piece of
 * equipment (weapon or armor) whose RequiredLevel is within
 * RandomLevelLoot.LevelsBelow levels of the reference level.
 *
 * The reference level is the lowest of the creature's level and the level of the
 * lowest group member in loot range, so a high level player farming low level
 * creatures only ever sees low level items, and a low level player carried by a
 * high level group only ever sees items for their own level.
 *
 * Each quality tier is rolled independently (RandomLevelLoot.Chance.*) and the
 * best tier that succeeds wins, so at most one piece of gear is added per kill.
 *
 * Potions have their own roll (RandomLevelLoot.Potion.*) with a wider level
 * window, since only one or two potions exist per level.
 *
 * Config: RandomLevelLoot.* in worldserver.elwynnkeep.conf.
 */
class RandomLevelLootMgr
{
public:
    static RandomLevelLootMgr* instance();

    // Quality tiers, ordered from worst to best.
    enum Tier : uint8
    {
        TIER_COMMON = 0, // poor, normal and uncommon quality
        TIER_RARE   = 1, // rare quality
        TIER_EPIC   = 2, // epic quality

        TIER_MAX
    };

    // Builds the per-level gear and potion buckets from the loaded item templates. Must run after ObjectMgr::LoadItemTemplates().
    void LoadItemPool();

    // Adds up to one piece of gear and up to one potion to the creature loot when the system, the creature and the rolls qualify.
    void AddRandomItem(Loot& loot, Creature const* creature, Player const* looter) const;

    // Rolls the tier for a kill. Returns TIER_MAX when no tier succeeded.
    [[nodiscard]] static Tier RollTier();

    // Picks a piece of gear of the given tier that the looter can equip and whose level is in the window below referenceLevel. Returns 0 when nothing fits.
    [[nodiscard]] uint32 RollItemId(Player const* looter, uint8 referenceLevel, Tier tier) const;

    // Picks a potion whose level is in the potion window below referenceLevel. Returns 0 when nothing fits.
    [[nodiscard]] uint32 RollPotionId(Player const* looter, uint8 referenceLevel) const;

    // The level the loot windows hang below: the lowest of the creature's level and the lowest group member in loot range of it.
    [[nodiscard]] static uint8 GetReferenceLevel(Creature const* creature, Player const* looter);

    // Whether the creature should receive the extra item. Excludes critters, pets, totems, triggers and creatures without a loot template.
    [[nodiscard]] static bool IsEligibleCreature(Creature const* creature);

    // Whether the item may be part of the gear pool: real, equippable weapons and armor of at most epic quality, not part
    // of a set, not above RandomLevelLoot.MaxItemLevel and without special requirements.
    [[nodiscard]] static bool IsEligibleItem(ItemTemplate const& proto);

    // Whether the item may be part of the potion pool: real, non-conjured potions with a RequiredLevel and no special requirements.
    [[nodiscard]] static bool IsEligiblePotion(ItemTemplate const& proto);

    // Whether the looter can ever equip the item (class and race masks). Armor type and stats are deliberately not checked.
    [[nodiscard]] static bool IsUsableByPlayer(ItemTemplate const& proto, Player const* looter);

    // The tier an item quality belongs to. Returns TIER_MAX for qualities that never drop.
    [[nodiscard]] static Tier GetTierForQuality(uint32 quality);

private:
    RandomLevelLootMgr() = default;
    ~RandomLevelLootMgr() = default;

    // Placeholder, test and NPC-only items that exist in the template store but are never meant for players.
    [[nodiscard]] static bool IsJunkName(std::string const& name);

    // Quest, requirement and junk checks shared by gear and potions.
    [[nodiscard]] static bool HasCommonRestrictions(ItemTemplate const& proto);

    using LevelBuckets = std::vector<std::vector<uint32>>;
    using TierBuckets = std::array<std::vector<uint32>, TIER_MAX>;

    // Picks one item the looter can use from the levels [referenceLevel - levelsBelow, referenceLevel]: the level is chosen
    // uniformly among the levels that have a usable item, then the item uniformly within that level.
    template<typename BucketForLevel>
    [[nodiscard]] static uint32 PickFromWindow(Player const* looter, uint8 referenceLevel, uint32 levelsBelow, std::size_t poolSize, BucketForLevel bucketForLevel);

    // _pool[level][tier] holds every eligible gear item id with that RequiredLevel and quality tier.
    std::vector<TierBuckets> _pool;

    // _potions[level] holds every eligible potion id with that RequiredLevel.
    LevelBuckets _potions;
};

#define sRandomLevelLootMgr RandomLevelLootMgr::instance()

#endif
