/**
 * V3.0 库存服务集成层
 * 在现有服务基础上集成统一库存服务，实现库存联动
 */

import { StockType, SourceType, BusinessType, FrozenType } from '../../types/inventory';
import * as inventoryService from './inventoryService';

/**
 * 种源入库（集成统一库存服务）
 * @param {Object} seedSource - 种源记录
 * @param {string} operatorId - 操作人ID
 * @param {string} operatorName - 操作人姓名
 * @returns {Promise<Object>}
 */
export async function inboundSeedSource(seedSource, operatorId, operatorName) {
  const sourceType = seedSource.supplierIsInternal
    ? SourceType.SELF_PRODUCED
    : SourceType.EXTERNAL_PURCHASED;

  const request = {
    stockType: StockType.SEED,
    businessId: seedSource.id,
    businessType: BusinessType.SEED_SOURCE,
    cropId: seedSource.cropCode,
    cropName: seedSource.cropName,
    varietyId: seedSource.cropCode,
    varietyName: seedSource.varietyName,
    quantity: seedSource.availableCount,
    unit: seedSource.unit,
    sourceType,
    supplierId: seedSource.supplierId,
    supplierName: seedSource.supplierName,
    baseId: seedSource.baseId,
    baseName: seedSource.baseName,
    productionPlanId: seedSource.productionPlanId,
    productionPlanCode: seedSource.productionPlanCode,
    remarks: seedSource.remarks,
  };

  return inventoryService.inbound(request, operatorId, operatorName);
}

/**
 * 种源出库（向育苗模块出库）
 * @param {string} seedSourceId - 种源ID
 * @param {number} quantity - 出库数量
 * @param {string} businessId - 关联业务ID
 * @param {string} businessCode - 关联业务编号
 * @param {string} operatorId - 操作人ID
 * @param {string} operatorName - 操作人姓名
 * @returns {Promise<Object>}
 */
export async function outboundSeedSource(seedSourceId, quantity, businessId, businessCode, operatorId, operatorName) {
  const stock = await inventoryService.getInventoryByBusinessId(seedSourceId);
  if (!stock) {
    return { success: false, error: '未找到种源库存记录' };
  }

  const request = {
    instanceId: stock.instanceId,
    businessId,
    businessType: BusinessType.SEEDLING,
    businessCode,
    quantity,
    operatorId,
    operatorName,
    remarks: '种源出库至育苗',
  };

  return inventoryService.outbound(request);
}

/**
 * 育苗入库（集成统一库存服务）
 * @param {Object} seedling - 育苗记录
 * @param {string} operatorId - 操作人ID
 * @param {string} operatorName - 操作人姓名
 * @returns {Promise<Object>}
 */
export async function inboundSeedling(seedling, operatorId, operatorName) {
  let sourceInstanceId, sourceBusinessId, sourceBusinessType;

  if (seedling.sourceId) {
    const sourceStock = await inventoryService.getInventoryByBusinessId(seedling.sourceId);
    if (sourceStock) {
      sourceInstanceId = sourceStock.instanceId;
      sourceBusinessId = seedling.sourceId;
      sourceBusinessType = BusinessType.SEED_SOURCE;
    }
  }

  const request = {
    stockType: StockType.SEEDLING,
    businessId: seedling.id,
    businessType: BusinessType.SEEDLING,
    cropId: seedling.cropCode,
    cropName: seedling.cropName,
    varietyId: seedling.cropCode,
    varietyName: seedling.cropVariety,
    quantity: seedling.survivalCount,
    unit: '株',
    sourceType: sourceInstanceId ? SourceType.SELF_PRODUCED : SourceType.EXTERNAL_PURCHASED,
    productionPlanId: seedling.productionPlanId,
    productionPlanCode: seedling.productionPlanCode,
    sourceInstanceId,
    sourceBusinessId,
    sourceBusinessType,
  };

  return inventoryService.inbound(request, operatorId, operatorName);
}

/**
 * 育苗出库（向种植模块出库）
 * @param {string} seedlingId - 育苗ID
 * @param {number} quantity - 出库数量
 * @param {string} businessId - 关联业务ID
 * @param {string} businessCode - 关联业务编号
 * @param {string} operatorId - 操作人ID
 * @param {string} operatorName - 操作人姓名
 * @returns {Promise<Object>}
 */
export async function outboundSeedling(seedlingId, quantity, businessId, businessCode, operatorId, operatorName) {
  const stock = await inventoryService.getInventoryByBusinessId(seedlingId);
  if (!stock) {
    return { success: false, error: '未找到育苗库存记录' };
  }

  const request = {
    instanceId: stock.instanceId,
    businessId,
    businessType: BusinessType.PLANTING,
    businessCode,
    quantity,
    operatorId,
    operatorName,
    remarks: '育苗出库至种植',
  };

  return inventoryService.outbound(request);
}

/**
 * 采收入库（集成统一库存服务）
 * 根据 harvestType 决定入库到哪种库存：
 * - seed: 入库到种源库存
 * - seedling: 入库到育苗库存
 * - product: 入库到产品库存
 *
 * @param {Object} harvestRecord - 采收记录
 * @param {string} operatorId - 操作人ID
 * @param {string} operatorName - 操作人姓名
 * @returns {Promise<Object>}
 */
export async function inboundHarvest(harvestRecord, operatorId, operatorName) {
  const harvestType = harvestRecord.harvestType || 'product';
  const targetInventory = harvestRecord.targetInventory || 'product';

  let stockType;
  switch (targetInventory) {
    case 'seed':
      stockType = StockType.SEED;
      break;
    case 'seedling':
      stockType = StockType.SEEDLING;
      break;
    default:
      stockType = StockType.PRODUCT;
  }

  const sourceType = SourceType.SELF_PRODUCED;

  const request = {
    stockType,
    businessId: harvestRecord.id,
    businessType: BusinessType.HARVEST,
    cropId: harvestRecord.cropCode || '',
    cropName: harvestRecord.cropName,
    varietyId: harvestRecord.cropCode,
    varietyName: harvestRecord.variety,
    quantity: harvestRecord.harvestQuantity,
    unit: harvestRecord.unit,
    sourceType,
    productionPlanId: harvestRecord.productionPlanId,
    productionPlanCode: harvestRecord.productionPlanCode,
    sourceInstanceId: harvestRecord.plantingInstanceId,
    sourceBusinessId: harvestRecord.plantingInstanceId,
    sourceBusinessType: BusinessType.PLANTING,
    extensions: {
      harvestType,
      harvestCode: harvestRecord.harvestCode,
      batchCode: harvestRecord.batchCode,
      greenhouseName: harvestRecord.greenhouseName,
      plantingMode: harvestRecord.plantingMode,
      quality: harvestRecord.quality,
      grade: harvestRecord.grade,
    },
  };

  const result = await inventoryService.inbound(request, operatorId, operatorName);

  // 如果采收的是种子或种苗，需要冻结对应数量用于下次流转
  if (result.success && result.instanceId) {
    if (stockType === StockType.SEED || stockType === StockType.SEEDLING) {
      await inventoryService.freezeInventory({
        instanceId: result.instanceId,
        frozenType: FrozenType.TASK,
        frozenQuantity: harvestRecord.harvestQuantity,
        businessId: harvestRecord.id,
        businessType: BusinessType.HARVEST,
        operatorId,
        operatorName,
        remarks: '采收种子/种苗冻结，用于下次流转',
      });
    }
  }

  return result;
}

/**
 * 获取库存追溯信息
 * @param {string} instanceId - 库存实例ID
 * @returns {Promise<Object>}
 */
export async function getTraceInfo(instanceId) {
  const [upstream, downstream] = await Promise.all([
    inventoryService.traceUpstream(instanceId),
    inventoryService.traceDownstream(instanceId),
  ]);

  return {
    upstream,
    downstream,
  };
}

/**
 * 采购入库（集成统一库存服务）
 * @param {Object} purchaseRecord - 采购记录
 * @param {string} operatorId - 操作人ID
 * @param {string} operatorName - 操作人姓名
 * @returns {Promise<Object>}
 */
export async function inboundPurchase(purchaseRecord, operatorId, operatorName) {
  const request = {
    stockType: StockType.PRODUCT,
    businessId: purchaseRecord.id,
    businessType: BusinessType.PURCHASE,
    cropId: purchaseRecord.materialId || '',
    cropName: purchaseRecord.materialName,
    varietyId: '',
    varietyName: '',
    quantity: purchaseRecord.quantity,
    unit: purchaseRecord.unit,
    sourceType: SourceType.EXTERNAL_PURCHASED,
    supplierId: purchaseRecord.supplierId,
    supplierName: purchaseRecord.supplierName,
    remarks: purchaseRecord.remarks,
  };

  return inventoryService.inbound(request, operatorId, operatorName);
}

/**
 * 库存调拨
 * @param {string} sourceInstanceId - 源库存实例ID
 * @param {number} quantity - 调拨数量
 * @param {string} targetBusinessId - 目标业务ID
 * @param {string} targetBusinessType - 目标业务类型
 * @param {string} operatorId - 操作人ID
 * @param {string} operatorName - 操作人姓名
 * @returns {Promise<Object>}
 */
export async function transferInventory(sourceInstanceId, quantity, targetBusinessId, targetBusinessType, operatorId, operatorName) {
  const stock = await inventoryService.getInventoryByBusinessId(sourceInstanceId);
  if (!stock) {
    return { success: false, error: '未找到源库存记录' };
  }

  const request = {
    instanceId: stock.instanceId,
    businessId: targetBusinessId,
    businessType: targetBusinessType,
    businessCode: '',
    quantity,
    operatorId,
    operatorName,
    remarks: '库存调拨',
  };

  return inventoryService.outbound(request);
}
