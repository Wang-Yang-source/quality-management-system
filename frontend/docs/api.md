# API 文档 - 产品质量管理系统 🚀

## 1. 生成模拟数据 (Generate Sample Data) 📊

**请求 URL**: `/generate-data`  
**请求方法**: `POST`  
**请求体**:

```json
{
  "groups": 25,
  "samplesPerGroup": 5,
  "mean": 100.0,
  "stddev": 10.0
}
```

* `groups` (int): 数据组数，默认为 25。  
* `samplesPerGroup` (int): 每组的数据数量，默认为 5。  
* `mean` (double): 数据的均值，默认为 100.0。  
* `stddev` (double): 数据的标准差，默认为 10.0。  

**响应**:

```json
{
  "success": true,
  "data": [
    [sample_data_group_1],
    [sample_data_group_2],
    ...
  ]
}
```

* `success` (bool): 操作是否成功。  
* `data` (array): 生成的模拟数据，按组返回二维数组。  

---

## 2. 导入数据 (Import Data) 📥

**请求 URL**: `/import-data`  
**请求方法**: `POST`  
**请求体**:

```json
{
  "data": [
    [data_group_1],
    [data_group_2],
    ...
  ]
}
```

* `data` (array): 导入的数据，二维数组形式。  

**响应**:

```json
{
  "success": true,
  "message": "数据导入成功",
  "count": 25
}
```

* `success` (bool): 操作是否成功。  
* `message` (string): 操作结果消息。  
* `count` (int): 导入的数据组数量。  

---

## 3. 描述性统计分析 (Descriptive Stats) 📈

**请求 URL**: `/descriptive-stats`  
**请求方法**: `POST`  
**请求体**: 无需请求体。  

**响应**:

```json
{
  "success": true,
  "stats": {
    "overall": {
      "mean": 100.0,
      "variance": 100.0,
      "standardDeviation": 10.0,
      "range": 20.0,
      "minimum": 80.0,
      "maximum": 120.0,
      "median": 100.0,
      "skewness": 0.5,
      "kurtosis": 2.0,
      "sampleSize": 25
    },
    "groups": {
      "mean": 100.0,
      "standardDeviation": 10.0,
      "range": 20.0,
      "minimum": 80.0,
      "maximum": 120.0
    },
    "histogram": [10, 20, 30, ...]
  }
}
```

* `success` (bool): 操作是否成功。  
* `stats` (object): 统计结果，包括整体统计和分组统计。  

  * `overall` (object): 整体描述性统计量。  
  * `groups` (object): 分组统计量。  
  * `histogram` (array): 直方图区间数据。  

---

## 4. 正态性检验 (Normality Test) 🔍

**请求 URL**: `/normality-test`  
**请求方法**: `POST`  
**请求体**: 无需请求体。  

**响应**:

```json
{
  "success": true,
  "isNormal": true,
  "pValue": 0.05,
  "statistic": 1.23,
  "testMethod": "Shapiro-Wilk",
  "conclusion": "数据符合正态分布 (p > 0.05)"
}
```

* `success` (bool): 操作是否成功。  
* `isNormal` (bool): 数据是否符合正态分布。  
* `pValue` (double): 正态性检验的 p 值。  
* `statistic` (double): 正态性检验统计量。  
* `testMethod` (string): 使用的正态性检验方法。  
* `conclusion` (string): 检验结论。  

---

## 5. 均值检验 (Mean Test) ⚖️

**请求 URL**: `/mean-test`  
**请求方法**: `POST`  
**请求体**:

```json
{
  "expectedMean": 100.0,
  "alpha": 0.05
}
```

* `expectedMean` (double): 期望的总体均值，默认为 100.0。  
* `alpha` (double): 显著性水平，默认为 0.05。  

**响应**:

```json
{
  "success": true,
  "sampleMean": 98.0,
  "expectedMean": 100.0,
  "tStatistic": -2.0,
  "pValue": 0.05,
  "alpha": 0.05,
  "testResult": false,
  "conclusion": "不拒绝原假设，样本均值与期望均值无显著差异"
}
```

* `success` (bool): 操作是否成功。  
* `sampleMean` (double): 样本均值。  
* `expectedMean` (double): 期望均值。  
* `tStatistic` (double): t 统计量。  
* `pValue` (double): p 值。  
* `alpha` (double): 显著性水平。  
* `testResult` (bool): 是否拒绝原假设。  
* `conclusion` (string): 检验结论。  

---

## 6. 过程能力指数 (Capability Indices) 📐

**请求 URL**: `/capability-indices`  
**请求方法**: `POST`  
**请求体**:

```json
{
  "lsl": 70.0,
  "usl": 130.0
}
```

* `lsl` (double): 下规格限，默认为 70.0。  
* `usl` (double): 上规格限，默认为 130.0。  

**响应**:

```json
{
  "success": true,
  "cp": 1.33,
  "cpk": 1.25,
  "cpl": 1.10,
  "cpu": 1.40,
  "pp": 1.30,
  "ppk": 1.28,
  "k": 0.9,
  "lsl": 70.0,
  "usl": 130.0
}
```

* `success` (bool): 操作是否成功。  
* `cp` (double): 过程能力指数 Cp。  
* `cpk` (double): 过程能力指数 Cpk。  
* `cpl` (double): 过程能力指数 Cpl。  
* `cpu` (double): 过程能力指数 Cpu。  
* `pp` (double): 过程性能指数 Pp。  
* `ppk` (double): 过程性能指数 Ppk。  
* `k` (double): 偏移系数。  
* `lsl` (double): 下规格限。  
* `usl` (double): 上规格限。  

---

## 7. 控制图数据 (Control Chart Data) 📉

**请求 URL**: `/control-chart`  
**请求方法**: `POST`  
**请求体**: 无需请求体。  

**响应**:

```json
{
  "success": true,
  "means": [100.0, 102.0, 98.0, ...],
  "ranges": [5.0, 7.0, 6.0, ...],
  "uclMean": 110.0,
  "lclMean": 90.0,
  "clMean": 100.0,
  "uclRange": 10.0,
  "lclRange": 0.0,
  "clRange": 5.0,
  "isControlled": true
}
```

* `success` (bool): 操作是否成功。  
* `means` (array): 每个数据组的均值。  
* `ranges` (array): 每个数据组的极差。  
* `uclMean` (double): 均值的上控制限。  
* `lclMean` (double): 均值的下控制限。  
* `clMean` (double): 均值的中心线。  
* `uclRange` (double): 极差的上控制限。  
* `lclRange` (double): 极差的下控制限。  
* `clRange` (double): 极差的中心线。  
* `isControlled` (bool): 过程是否受控。  

---

## 8. 过程评估 (Process Assessment) 🛠️

**请求 URL**: `/process-assessment`  
**请求方法**: `POST`  
**请求体**:

```json
{
  "lsl": 70.0,
  "usl": 130.0
}
```

* `lsl` (double): 下规格限，默认为 70.0。  
* `usl` (double): 上规格限，默认为 130.0。  

**响应**:

```json
{
  "success": true,
  "stabilityStatus": "过程稳定，处于统计受控状态",
  "capabilityLevel": "过程能力优秀 (Cpk >= 1.33)",
  "recommendations": "维持当前工艺水平，进行定期监控"
}
```

* `success` (bool): 操作是否成功。  
* `stabilityStatus` (string): 程序的稳定性状态。  
* `capabilityLevel` (string): 程序的能力水平。  
* `recommendations` (string): 改进建议。  

---

## 9. 所有分析 (All Analysis) 🧪

**请求 URL**: `/all-analysis`  
**请求方法**: `POST`  
**请求体**:

```json
{
  "lsl": 70.0,
  "usl": 130.0,
  "expectedMean": 100.0,
  "alpha": 0.05
}
```

* `lsl` (double): 下规格限，默认为 70.0。  
* `usl` (double): 上规格限，默认为 130.0。  
* `expectedMean` (double): 期望均值，默认为 100.0。  
* `alpha` (double): 显著性水平，默认为 0.05。  

**响应**:

```json
{
  "success": true,
  "analysis": {
    "descriptiveStats": { ... },
    "normalityTest": { ... },
    "meanTest": { ... },
    "capabilityIndices": { ... },
    "controlChart": { ... },
    "processAssessment": { ... },
    "histogram": [10, 20, 30, ...]
  }
}
```

* `success` (bool): 操作是否成功。  
* `analysis` (object): 所有分析结果的汇总。  

---

### 注意事项 ⚠️

* **请求体格式**: 所有请求体都应该是合法的 JSON 格式，确保字段和数据类型与文档一致。  
* **响应格式**: 所有响应均为 JSON 格式，包含 `success` 字段来标识请求是否成功，并返回相关数据或错误信息。  
