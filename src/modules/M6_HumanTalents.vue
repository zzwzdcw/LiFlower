<!--
  模块编号：M6
  模块名称：专长（人类）
  显示模式：human-prep
  功能：2-6个专长槽，大脑电子化按钮，电子脑插入
-->
<template>
  <div class="module-human-talents">
    <ModuleHeader title="专长" subtitle="Talents">
      <template #right>
        <button
          :class="['cyber-button', { active: isCyberBrainActive }]"
          :disabled="!canActivateCyberBrain"
          @click="toggleCyberBrain"
        >
          <span class="button-icon">{{ isCyberBrainActive ? '◉' : '○' }}</span>
          <span class="button-text">大脑电子化</span>
        </button>
      </template>
    </ModuleHeader>

    <!-- 专长列表 -->
    <div class="talents-list">
      <!-- 电子脑（大脑电子化激活时插入最前面） -->
      <CyberBrainItem v-if="isCyberBrainActive" />

      <!-- 普通专长 -->
      <TalentItem
        v-for="(talent, index) in talents"
        :key="index"
        v-model="talents[index]"
        :index="index"
        :show-delete-button="canDeleteTalent"
        @delete="removeTalent(index)"
        @clear="clearTalent(index)"
      />
    </div>

    <!-- 新增专长按钮（最多6个，电子脑占用1个槽位） -->
    <div v-if="showAddButton" class="add-button-row">
      <button class="add-talent-btn" @click="addTalent">
        <span class="add-icon">+</span>
        <span class="add-text">新增专长</span>
      </button>
    </div>

    <!-- 提示信息（当无法激活电子脑时显示） -->
    <div v-if="showCyberBrainWarning" class="warning-text">
      专长槽位已满，请先删除一个专长再激活大脑电子化
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAutoOutput } from '@/composables/useModuleOutput'
import { getM6Cache } from '@/utils/cacheManager'
import TalentItem from '@/components/TalentItem.vue'
import CyberBrainItem from '@/components/CyberBrainItem.vue'
import ModuleHeader from '@/components/ModuleHeader.vue'
import skillsData from '@/data/skills.json'

// 大脑电子化状态
const isCyberBrainActive = ref(false)

// 创建空专长模板
const createEmptyTalent = () => ({
  name: '',
  skill: '',
  limitation: '',
  description: ''
})

// 专长数据（默认2个，大脑电子化激活时自动调整为1个）
const talents = ref([
  createEmptyTalent(),
  createEmptyTalent()
])

// 监听大脑电子化状态变化，调整专长数量
watch(isCyberBrainActive, (newVal) => {
  if (newVal) {
    // 激活时：如果专长数量为2且都为空，减少到1个
    if (talents.value.length === 2) {
      const bothEmpty = !talents.value[0].name && !talents.value[1].name &&
                        !talents.value[0].skill && !talents.value[1].skill
      if (bothEmpty) {
        talents.value = [createEmptyTalent()]
      }
    }
  } else {
    // 关闭时：如果专长数量为1，增加到2个
    if (talents.value.length === 1) {
      talents.value.push(createEmptyTalent())
    }
  }
})

// 计算总槽位占用（专长 + 电子脑）
const totalSlots = computed(() => {
  return talents.value.length + (isCyberBrainActive.value ? 1 : 0)
})

// 检查专长是否有内容
const hasContent = (talent) => {
  return !!talent.name || !!talent.skill || !!talent.limitation || !!talent.description
}

// 计算已填写的专长数量
const filledTalentsCount = computed(() => {
  return talents.value.filter(t => hasContent(t)).length
})

// 是否可以激活大脑电子化
// 条件：总槽位（专长+电子脑）不超过6
const canActivateCyberBrain = computed(() => {
  if (isCyberBrainActive.value) {
    return true // 已经激活，可以关闭
  }
  // 未激活时检查：专长数+1（电子脑）<= 6
  return talents.value.length + 1 <= 6
})

// 是否显示警告（专长已满无法激活）
const showCyberBrainWarning = computed(() => {
  return !isCyberBrainActive.value && talents.value.length >= 6 && filledTalentsCount.value >= 6
})

// 切换大脑电子化状态
const toggleCyberBrain = () => {
  if (isCyberBrainActive.value) {
    // 关闭：直接关闭
    isCyberBrainActive.value = false
  } else {
    // 开启：检查是否可以开启
    if (!canActivateCyberBrain.value) {
      return
    }

    // 如果专长已满6个，但有未填写的，自动移除一个未填写的
    if (talents.value.length >= 6) {
      // 找到第一个未填写的专长
      const emptyIndex = talents.value.findIndex(t => !hasContent(t))
      if (emptyIndex !== -1) {
        talents.value.splice(emptyIndex, 1)
      } else {
        // 全都填满了，不能开启
        return
      }
    }

    isCyberBrainActive.value = true
  }
}

// 是否显示新增按钮（总槽位不超过6）
const showAddButton = computed(() => {
  return totalSlots.value < 6
})

// 是否可以删除专长
// 普通模式：最少2个专长
// 大脑电子化模式：最少1个专长（因为电子脑占用1个槽位）
const canDeleteTalent = computed(() => {
  const minTalents = isCyberBrainActive.value ? 1 : 2
  return talents.value.length > minTalents
})

// 添加专长
const addTalent = () => {
  if (totalSlots.value < 6) {
    talents.value.push(createEmptyTalent())
  }
}

// 清空专长内容
const clearTalent = (index) => {
  talents.value[index] = createEmptyTalent()
}

// 移除专长（补位机制）
const removeTalent = (index) => {
  // 检查是否达到最小数量限制
  // 普通模式最少2个，大脑电子化模式最少1个
  const minTalents = isCyberBrainActive.value ? 1 : 2
  if (talents.value.length <= minTalents) {
    return
  }

  // 移除指定索引的专长
  talents.value.splice(index, 1)
}

// 构建输出数据
const talentsOutput = computed(() => {
  const result = []

  // 如果电子脑激活，先输出电子脑
  if (isCyberBrainActive.value) {
    result.push({
      index: 1,
      type: 'cyberbrain',
      name: '电子脑',
      skill: 'special',
      skillName: '特殊专长',
      limitation: '可以方便地接入网络，将1AP兑换为1NP。但会受到神经破坏程序的攻击。',
      description: '电子脑严格意义上属于接口而非算力部件，连供电都没有，但是可以很方便地连接外部算力组件。所以使用电子脑必须有一台电子设备担任主机，有些神经连线会附带VR眼镜进行辅助操作。',
      isActive: true
    })
  }

  // 输出普通专长
  talents.value.forEach((talent, index) => {
    if (hasContent(talent)) {
      result.push({
        index: result.length + 1,
        type: 'talent',
        name: talent.name,
        skill: talent.skill,
        skillName: getSkillName(talent.skill),
        limitation: talent.limitation,
        description: talent.description,
        isActive: true
      })
    }
  })

  return result
})

// 获取技能名称
const getSkillName = (skillId) => {
  if (!skillId) return ''
  if (skillId === 'special') return '特殊专长'
  // 根据技能 ID 查找技能名称
  const skill = skillsData.find(s => s.id.toString() === skillId.toString())
  return skill ? skill.name : skillId
}

// 提取所有关联的技能ID（排除特殊对策）
const linkedSkillIds = computed(() => {
  return talents.value
    .filter(t => t.skill && t.skill !== 'special')
    .map(t => t.skill)
})

// 数据输出
useAutoOutput({
  isCyberBrainActive,
  cyberBrainStatus: computed(() => isCyberBrainActive.value ? 'activated' : 'inactive'),
  talents: talentsOutput,
  linkedSkillIds,
  activeTalentCount: computed(() => talentsOutput.value.length),
  totalTalentSlots: computed(() => talents.value.length),
  hasCyberBrain: computed(() => isCyberBrainActive.value)
})

// ==================== 缓存恢复和保存 ====================

// 从缓存恢复
onMounted(() => {
  const cache = getM6Cache()

  // 恢复专长列表（逐个修改元素，保持引用不变）
  if (cache && cache.talents && Array.isArray(cache.talents) && cache.talents.length > 0) {
    // 先调整数组长度
    while (talents.value.length < cache.talents.length) {
      talents.value.push({ name: '', skill: '', limitation: '', description: '' })
    }
    // 逐个修改元素
    cache.talents.forEach((t, index) => {
      if (talents.value[index]) {
        talents.value[index].name = t.name || ''
        talents.value[index].skill = t.skill || ''
        talents.value[index].limitation = t.limitation || ''
        talents.value[index].description = t.description || ''
      }
    })
    console.log('[M6] 从缓存恢复专长:', talents.value)
  } else {
    // 缓存为空时重置为初始状态
    talents.value = [
      { name: '', skill: '', limitation: '', description: '' },
      { name: '', skill: '', limitation: '', description: '' }
    ]
    isCyberBrainActive.value = false
    console.log('[M6] 缓存为空，重置专长')
  }

  // 恢复电子脑状态
  if (cache && cache.isCyberBrainActive) {
    isCyberBrainActive.value = true
    console.log('[M6] 从缓存恢复电子脑：激活')
  }
})

// 监听变化触发保存
watch([talents, isCyberBrainActive], () => {
  window.dispatchEvent(new CustomEvent('liflower-save-cache'))
}, { deep: true })

// 注册本地数据到全局缓存管理器
onMounted(() => {
  if (window.liflowerCache) {
    window.liflowerCache.registerM6({
      talents,
      isCyberBrainActive
    })
    console.log('[M6] 已注册到缓存管理器')
  } else {
    console.warn('[M6] window.liflowerCache 未定义')
  }
})
</script>

<style lang="scss" scoped>
$cyber-cyan: #00f3ff;
$cyber-purple: #bc13fe;
$cyber-red: #ff5252;

.module-human-talents {
  // 赛博朋克风格按钮
  .cyber-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(26, 26, 46, 0.8);
    border: 1px solid rgba(0, 243, 255, 0.3);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: "Courier New", "Consolas", monospace;

    .button-icon {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.4);
      transition: all 0.3s ease;
    }

    .button-text {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      transition: all 0.3s ease;
    }

    &:hover:not(:disabled) {
      background: rgba(0, 243, 255, 0.1);
      border-color: rgba(0, 243, 255, 0.5);
      box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);

      .button-icon {
        color: rgba(0, 243, 255, 0.6);
      }

      .button-text {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    &.active {
      background: linear-gradient(
        135deg,
        rgba(0, 243, 255, 0.2),
        rgba(188, 19, 254, 0.2)
      );
      border-color: $cyber-cyan;
      box-shadow: 0 0 15px rgba(0, 243, 255, 0.3), inset 0 0 10px rgba(0, 243, 255, 0.1);

      .button-icon {
        color: $cyber-cyan;
        text-shadow: 0 0 8px rgba(0, 243, 255, 0.8);
      }

      .button-text {
        color: $cyber-cyan;
        font-weight: 600;
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.4), inset 0 0 15px rgba(0, 243, 255, 0.2);
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      border-color: rgba(255, 255, 255, 0.1);

      .button-text {
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }

  .talents-list {
    margin-top: 16px;
  }

  // 新增专长按钮
  .add-button-row {
    margin-top: 16px;
    padding-top: 8px;
    border-top: 1px dashed rgba(0, 243, 255, 0.2);
    display: flex;
    justify-content: center;
  }

  .add-talent-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(0, 243, 255, 0.05);
    border: 1px dashed rgba(0, 243, 255, 0.4);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: "Courier New", "Consolas", monospace;

    .add-icon {
      color: $cyber-cyan;
      font-size: 16px;
      font-weight: bold;
    }

    .add-text {
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
    }

    &:hover {
      background: rgba(0, 243, 255, 0.1);
      border-color: $cyber-cyan;
      box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);

      .add-text {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    &:active {
      transform: scale(0.98);
    }
  }

  // 警告文本
  .warning-text {
    margin-top: 12px;
    padding: 8px 12px;
    background: rgba(255, 82, 82, 0.1);
    border: 1px solid rgba(255, 82, 82, 0.3);
    border-radius: 4px;
    color: $cyber-red;
    font-size: 12px;
    text-align: center;
    font-family: "Courier New", monospace;
  }
}
</style>
