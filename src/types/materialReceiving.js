/**
 * 物料领用类型定义
 */

/**
 * 领料单物料明细
 * @typedef {Object} MaterialItem
 * @property {string} materialCode - 物料编码
 * @property {string} materialName - 物料名称
 * @property {string} spec - 规格
 * @property {string} unit - 单位
 * @property {string} category - 分类
 * @property {number} requestedQuantity - 申请数量
 * @property {number} stockQuantity - 库存数量
 * @property {number} unitPrice - 单价
 * @property {string} warehousePosition - 仓库货位
 * @property {string} [batchNo] - 批次号（批次级库存追溯）
 * @property {string} [remark] - 备注
 */

/**
 * 领料单状态
 * @typedef {'pending'|'approved'|'rejected'|'completed'|'voided'} ReceivingStatus
 */

/**
 * 领料单记录
 * @typedef {Object} MaterialReceivingRecord
 * @property {number} id - ID
 * @property {string} code - 领料单号
 * @property {string} date - 领料日期
 * @property {string} applicant - 申请人
 * @property {string} department - 部门
 * @property {string} warehouseLocation - 仓库货位
 * @property {string} plantArea - 种植区域
 * @property {string} reviewer - 审核人
 * @property {string} productionBatchCode - 生产批次编号
 * @property {ReceivingStatus} status - 状态
 * @property {string} statusClass - 状态样式类
 * @property {string} [rejectReason] - 驳回原因
 * @property {MaterialItem[]} materials - 物料明细
 */

/**
 * 领料出库物料明细
 * @typedef {Object} ExecuteMaterialItem
 * @property {string} materialCode - 物料编码
 * @property {string} materialName - 物料名称
 * @property {string} [batchNo] - 批次号（批次级库存追溯）
 * @property {string} spec - 规格
 * @property {string} unit - 单位
 * @property {string} category - 分类
 * @property {number} requestedQuantity - 申请数量
 * @property {number} stockQuantity - 库存数量
 * @property {number} actualQuantity - 实际数量
 * @property {string} [remark] - 备注
 * @property {string} applicationCode - 来源申请单号
 * @property {number} [unitPrice] - 单价
 * @property {string} [warehousePosition] - 仓库货位
 */

/**
 * 领料出库状态
 * @typedef {'pending'|'approved'|'rejected'|'completed'|'voided'} ExecuteStatus
 */

/**
 * 领料出库单记录
 * @typedef {Object} MaterialExecuteRecord
 * @property {string|number} id - ID
 * @property {string} code - 出库单号
 * @property {string} date - 出库日期
 * @property {string} applicant - 申请人
 * @property {string} warehouseLocation - 仓库货位
 * @property {string} reviewer - 审核人
 * @property {string} operator - 操作员
 * @property {string} productionBatchCode - 生产批次编号
 * @property {string[]} sourceApplicationCodes - 来源申请单号列表
 * @property {ExecuteStatus} executeStatus - 执行状态
 * @property {string} executeStatusClass - 执行状态样式类
 * @property {ExecuteMaterialItem[]} materials - 物料明细
 */

/**
 * 月份汇总行（未展开状态）
 * @typedef {Object} MonthSummaryRow
 * @property {string} month - 月份
 * @property {string} monthName - 月份名称
 * @property {number} totalQuantity - 总数量
 * @property {number} totalAmount - 总金额
 * @property {number} percentage - 占比
 */

/**
 * 月份明细行（展开状态）
 * @typedef {Object} MonthDetailRow
 * @property {string} month - 月份
 * @property {string} monthName - 月份名称
 * @property {string} categoryKey - 分类键
 * @property {string} categoryName - 分类名称
 * @property {number} quantity - 数量
 * @property {number} amount - 金额
 * @property {number} percentage - 占比
 */

/**
 * 月度统计数据
 * @typedef {Object} MonthlyStatistics
 * @property {string} year - 年份
 * @property {string} month - 月份
 * @property {string} department - 部门
 * @property {number} requisitionCount - 领料单数
 * @property {number} materialTypes - 物料种类数
 * @property {number} totalQuantity - 总数量
 * @property {number} actualQuantity - 实际数量
 * @property {number} differenceRate - 差异率
 * @property {number} totalAmount - 总金额
 */

/**
 * 物料统计数据
 * @typedef {Object} MaterialStatistics
 * @property {string} materialCode - 物料编码
 * @property {string} materialName - 物料名称
 * @property {string} category - 分类
 * @property {string} spec - 规格
 * @property {string} barcode - 条码
 * @property {string} unit - 单位
 * @property {string} supplier - 供应商
 * @property {string} batchCode - 批次编号
 * @property {string} productionDate - 生产日期
 * @property {string} expiryDate - 过期日期
 * @property {string} productionPlanBatchCode - 生产计划批次编号
 * @property {string} requisitionDepartment - 领料部门
 * @property {string} usageArea - 使用区域
 * @property {string} requisitioner - 领料人
 * @property {string} requisitionTime - 领料时间
 * @property {number} requisitionCount - 领料次数
 * @property {number} totalQuantity - 总数量
 * @property {number} actualQuantity - 实际数量
 * @property {number} totalAmount - 总金额
 * @property {string} mainWarehouse - 主仓库
 */

/**
 * 部门统计数据
 * @typedef {Object} DepartmentStatistics
 * @property {string} applicant - 申请人
 * @property {string} department - 部门
 * @property {number} requisitionCount - 领料单数
 * @property {number} requisitionOrders - 领料订单数
 * @property {number} materialTypes - 物料种类数
 * @property {number} totalQuantity - 总数量
 * @property {number} totalAmount - 总金额
 * @property {number} avgPerOrder - 每单平均
 * @property {number} avgAmount - 平均金额
 * @property {string[]} topMaterials - 热门物料
 */

/**
 * 大棚统计数据
 * @typedef {Object} GreenhouseStatistics
 * @property {string} greenhouse - 大棚
 * @property {string} greenhouseType - 大棚类型
 * @property {string} period - 周期
 * @property {number} requisitionCount - 领料单数
 * @property {number} materialTypes - 物料种类数
 * @property {number} totalQuantity - 总数量
 * @property {number} totalAmount - 总金额
 * @property {Object} comparison - 对比数据
 */

/**
 * 大田统计数据
 * @typedef {Object} FieldStatistics
 * @property {string} field - 田块
 * @property {string} crop - 作物
 * @property {string} period - 周期
 * @property {number} requisitionCount - 领料单数
 * @property {number} materialTypes - 物料种类数
 * @property {number} totalQuantity - 总数量
 * @property {number} totalAmount - 总金额
 * @property {Object} comparison - 对比数据
 */

/**
 * 批次统计数据
 * @typedef {Object} BatchStatistics
 * @property {string} batchCode - 批次编号
 * @property {string} cropName - 作物名称
 * @property {string} variety - 品种
 * @property {string} plantArea - 种植区域
 * @property {string} areaSize - 面积
 * @property {string} plannedStartDate - 计划开始日期
 * @property {string} plannedEndDate - 计划结束日期
 * @property {number} requisitionCount - 领料单数
 * @property {number} materialTypes - 物料种类数
 * @property {number} totalQuantity - 总数量
 * @property {number} actualQuantity - 实际数量
 * @property {number} totalAmount - 总金额
 * @property {Array} details - 物料明细
 */

/**
 * 物料分类颜色配置
 * @typedef {Object} CategoryColors
 * @property {string[]} gradient - 渐变色
 * @property {string} solid - 纯色
 */

/**
 * 物料分类汇总数据
 * @typedef {Object} CategorySummary
 * @property {string} name - 名称
 * @property {string} key - 键
 * @property {number} value - 值
 * @property {number} amount - 金额
 * @property {number} percentage - 占比
 * @property {string[]} gradient - 渐变色
 * @property {string} solid - 纯色
 */

/**
 * 月度趋势数据
 * @typedef {Object} CategoryTrend
 * @property {string} month - 月份
 * @property {number} 生产投入 - 生产投入类
 * @property {number} 设施装备 - 设施装备类
 * @property {number} 作业支持 - 作业支持类
 * @property {number} 采后流通 - 采后流通类
 * @property {number} 数字管理 - 数字管理类
 * @property {number} 能源耗材 - 能源耗材类
 * @property {number} 其他 - 其他类
 * @property {number} total - 总计
 */

/**
 * 图表数据
 * @typedef {Object} TrendChartData
 * @property {string} month - 月份
 * @property {number} quantity - 数量
 * @property {number} amount - 金额
 */

/**
 * 部门饼图数据
 * @typedef {Object} DepartmentPieData
 * @property {string} name - 名称
 * @property {number} value - 值
 * @property {number} percentage - 占比
 */

/**
 * 分类饼图数据
 * @typedef {Object} CategoryPieData
 * @property {string} name - 名称
 * @property {number} value - 值
 * @property {number} percentage - 占比
 */

/**
 * 成本统计数据
 * @typedef {Object} CostStatistics
 * @property {string} period - 周期
 * @property {string} category - 分类
 * @property {string} department - 部门
 * @property {string} batchCode - 批次编号
 * @property {number} totalCost - 总成本
 * @property {number} quantity - 数量
 * @property {number} avgPrice - 平均单价
 */

/**
 * 批次成本明细
 * @typedef {Object} BatchCostDetail
 * @property {string} batchCode - 批次编号
 * @property {string} cropName - 作物名称
 * @property {string} area - 面积
 * @property {number} materialCount - 物料种类数
 * @property {number} totalCost - 总成本
 * @property {number} unitCost - 单位成本
 */

/**
 * 部门成本对比
 * @typedef {Object} DepartmentCost
 * @property {string} department - 部门
 * @property {number} requisitionCount - 领料单数
 * @property {number} materialTypes - 物料种类数
 * @property {number} totalCost - 总成本
 * @property {number} percentage - 占比
 * @property {number} rank - 排名
 */

/**
 * 供应商价格对比
 * @typedef {Object} SupplierPriceComparison
 * @property {string} supplier - 供应商
 * @property {number} materialTypes - 物料种类数
 * @property {number} totalAmount - 总金额
 * @property {number} avgPrice - 平均单价
 * @property {number} priceIndex - 价格指数
 */

/**
 * 成本分类汇总
 * @typedef {Object} CostCategorySummary
 * @property {string} category - 分类
 * @property {number} requisitionCount - 领料单数
 * @property {number} totalQuantity - 总数量
 * @property {number} totalAmount - 总金额
 * @property {number} percentage - 占比
 * @property {number} monthOverMonth - 环比
 */

/**
 * 领料申请新增/编辑表单状态
 * @typedef {Object} MaterialRequestFormState
 * @property {string} code - 单号
 * @property {string} date - 日期
 * @property {string} applicant - 申请人
 * @property {string} department - 部门
 * @property {string} warehouseLocation - 仓库货位
 * @property {string} plantArea - 种植区域
 * @property {string} reviewer - 审核人
 * @property {string} productionBatchCode - 生产批次编号
 * @property {string} expectedDate - 期望日期
 * @property {string} remarks - 备注
 * @property {MaterialItem[]} materials - 物料列表
 */

/**
 * 领料出库新增表单状态
 * @typedef {Object} ExecuteAddFormState
 * @property {string} code - 单号
 * @property {string} date - 日期
 * @property {string} applicant - 申请人
 * @property {string} warehouseLocation - 仓库货位
 * @property {string} reviewer - 审核人
 * @property {string} operator - 操作员
 * @property {string} productionBatchCode - 生产批次编号
 * @property {string[]} sourceApplicationCodes - 来源申请单号列表
 * @property {string} remarks - 备注
 * @property {ExecuteMaterialItem[]} materials - 物料列表
 */

/**
 * 领料出库编辑表单状态
 * @typedef {Object} ExecuteEditFormState
 * @property {string} code - 单号
 * @property {string} date - 日期
 * @property {string} applicant - 申请人
 * @property {string} warehouseLocation - 仓库货位
 * @property {string} reviewer - 审核人
 * @property {string} operator - 操作员
 * @property {string} productionBatchCode - 生产批次编号
 * @property {string} remarks - 备注
 * @property {ExecuteMaterialItem[]} materials - 物料列表
 */

/**
 * 月度成本趋势
 * @typedef {Object} MonthlyCostTrend
 * @property {string} month - 月份
 * @property {number} totalCost - 总成本
 * @property {Object} categoryCosts - 分类成本
 */
