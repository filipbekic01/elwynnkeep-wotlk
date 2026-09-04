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
#include <vector>

class Creature;
class Player;
struct ItemTemplate;
struct Loot;

/**
 * Custom system: every lootable creature kill adds one extra random item from
 * the whole item pool whose level matches (or is a few levels below) the
 * looter's level.
 *
 * Config: RandomLevelLoot.* in worldserver.conf (CUSTOM section).
 */
class RandomLevelLootMgr
{
public:
    static RandomLevelLootMgr* instance();

    // Which item field is compared against the player level.
    enum LevelMode : uint32
    {
        LEVEL_MODE_REQUIRED_OR_ITEM = 0, // RequiredLevel when > 0, otherwise ItemLevel
        LEVEL_MODE_ITEM_LEVEL       = 1, // ItemLevel only
        LEVEL_MODE_REQUIRED_LEVEL   = 2  // RequiredLevel only (items with RequiredLevel 0 are excluded)
    };

    // Builds the per-level item buckets from the loaded item templates. Must run after ObjectMgr::LoadItemTemplates().
    void LoadItemPool();

    // Adds one random level-matched item to the creature loot when the system and the creature qualify.
    void AddRandomItem(Loot& loot, Creature const* creature, Player const* looter) const;

    // Rolls an item id for the given player level. Returns 0 when nothing is available.
    [[nodiscard]] uint32 RollItemId(uint8 playerLevel) const;

    // Whether the creature should receive the extra item. Excludes critters, pets, totems and creatures without a loot template.
    [[nodiscard]] static bool IsEligibleCreature(Creature const* creature);

    // Whether the item may be part of the pool. This is the place to tune which items can drop.
    [[nodiscard]] static bool IsEligibleItem(ItemTemplate const& proto);

    // The level an item is bucketed under for the current level mode. 0 means the item is not bucketed.
    [[nodiscard]] static uint32 GetItemLevelForPool(ItemTemplate const& proto, LevelMode mode);

private:
    RandomLevelLootMgr() = default;
    ~RandomLevelLootMgr() = default;

    // _itemsByLevel[level] holds every eligible item id bucketed under that level.
    std::vector<std::vector<uint32>> _itemsByLevel;
};

#define sRandomLevelLootMgr RandomLevelLootMgr::instance()

#endif
