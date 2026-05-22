/**
 * 作物品种库类型定义
 * 编码规则：类别(2位) + 类型(2位) + 品种(2位) + 子品种(3位) + 详细品种(2位) = 11位
 * 示例：FR010100101 = 水果类-浆果类-草莓-红颜-大叶红颜
 */

/** 作物品种状态 */
export type CropVarietyStatus = 'active' | 'inactive';

/** 作物品种库 - 系统数据基础表 */
export interface CropVariety {
  id: string;
  cropCode: string;
  categoryCode: string;
  categoryName: string;
  typeCode: string;
  typeName: string;
  varietyCode: string;
  varietyName: string;
  subVariety1Code?: string;
  subVariety1Name?: string;
  detailVarietyCode?: string;
  detailVarietyName?: string;
  alias?: string[];
  image?: string;
  description?: string;
  germinationPeriod?: number;
  seedlingPeriod?: number;
  floweringPeriod?: number;
  fruitingPeriod?: number;
  harvestPeriod?: number;
  airTemperature?: number;
  airHumidity?: number;
  co2Content?: number;
  lightIntensity?: number;
  soilTemperature?: number;
  soilHumidity?: number;
  soilPh?: number;
  soilEc?: number;
  status: CropVarietyStatus;
  remarks?: string;
  createTime: string;
  updateTime: string;
}

/** 新增品种的输入数据 */
export type CreateCropVarietyInput = Omit<CropVariety, 'id' | 'cropCode' | 'createTime' | 'updateTime'>;

/** 更新品种的输入数据 */
export type UpdateCropVarietyInput = Partial<Pick<CropVariety, 'alias' | 'image' | 'description' | 'germinationPeriod' | 'seedlingPeriod' | 'floweringPeriod' | 'fruitingPeriod' | 'harvestPeriod' | 'airTemperature' | 'airHumidity' | 'co2Content' | 'lightIntensity' | 'soilTemperature' | 'soilHumidity' | 'soilPh' | 'soilEc' | 'status' | 'remarks' | 'varietyName'>>;

/** 品种下拉选项格式 */
export interface CropVarietyOption {
  value: string;
  label: string;
  category: string;
  categoryCode: string;
  typeName: string;
  typeCode: string;
  varietyCode: string;
  subVariety1Name?: string;
  subVariety1Code?: string;
  detailVarietyCode?: string;
  detailVarietyName?: string;
  alias?: string[];
  fullPath: string;
}

/** 品种搜索结果 */
export interface CropVarietySearchResult {
  variety: CropVariety;
  matchField: 'cropCode' | 'varietyName' | 'alias';
  matchText: string;
}

/** 树形节点层级类型 */
export type TreeLevel = 'category' | 'type' | 'variety' | 'subVariety1' | 'detail';

/** 树形节点数据 */
export interface VarietyTreeNode {
  key: string;
  name: string;
  code: string;
  level: TreeLevel;
  children: VarietyTreeNode[];
  isLeaf: boolean;
  isRecorded: boolean;
  isExtension?: boolean;
  extensionId?: string;
  fullCropCode?: string;
  recordedVariety?: CropVariety;
  path: {
    categoryCode: string;
    categoryName: string;
    typeCode: string;
    typeName: string;
    varietyCode: string;
    varietyName: string;
    subVariety1Code?: string;
    subVariety1Name?: string;
  };
  hasChildren: boolean;
  childCount: number;
}

/** 显示模式 */
export type DisplayMode = 'recorded' | 'all';
