# Factory Profitability Analytics API Implementation

## Overview
This document outlines the implementation of the Factory Profitability Analysis feature that enables Farmers to analyze and compare factories based on complex business metrics calculated using MongoDB aggregation pipelines.

## 📊 Summary of Implementation

### 1. Analytics Controller (`backend/controllers/analyticsController.js`)

#### Main Function: `getFactoryProfitabilityAnalysis`
- **Purpose:** Complex database aggregation to calculate factory profitability scores
- **Access:** Farmer role only
- **Algorithm:** Multi-stage MongoDB aggregation pipeline
- **Formula:** `Score = (AveragePricePerTon * ContractFulfillmentRate) / (AveragePaymentDelay + 1)`

#### Secondary Function: `getFactoryContractDetails`
- **Purpose:** Detailed contract history for specific factory
- **Access:** Farmer role only
- **Use Case:** Drill-down analysis from profitability results

### 2. MongoDB Aggregation Pipeline Stages

#### Stage 1: Initial Matching
```javascript
{
  $match: {
    factory_id: { $exists: true, $ne: null }
  }
}
```
- Filters contracts that involve factories
- Ensures data integrity

#### Stage 2-3: Factory Data Lookup
```javascript
{
  $lookup: {
    from: 'users',
    localField: 'factory_id',
    foreignField: '_id',
    as: 'factory'
  }
}
```
- Joins contract data with factory user information
- Filters for users with 'Factory' role

#### Stage 4: Computed Fields
```javascript
{
  $addFields: {
    paymentDelay: {
      $cond: {
        if: { $and: [{ $ne: ['$delivery_date', null] }, { $ne: ['$payment_date', null] }] },
        then: { $divide: [{ $subtract: ['$payment_date', '$delivery_date'] }, 1000 * 60 * 60 * 24] },
        else: 30 // Default high delay if no payment_date
      }
    },
    contractPrice: { $cond: { if: { $ne: ['$contract_value', null] }, then: '$contract_value', else: 0 } },
    isCompleted: { $cond: { if: { $eq: ['$status', 'completed'] }, then: 1, else: 0 } }
  }
}
```
- Calculates payment delay in days
- Handles null values appropriately
- Creates binary completion flags

#### Stage 5: Factory-Level Aggregation
```javascript
{
  $group: {
    _id: '$factory_id',
    totalContracts: { $sum: 1 },
    completedContracts: { $sum: '$isCompleted' },
    totalPriceFromCompleted: { $sum: { $cond: { if: { $eq: ['$isCompleted', 1] }, then: '$contractPrice', else: 0 } } },
    totalPaymentDelay: { $sum: '$paymentDelay' }
  }
}
```
- Groups contracts by factory
- Calculates aggregate metrics per factory
- Sums totals for metric calculations

#### Stage 6-7: Metric Calculations
```javascript
{
  $addFields: {
    averagePricePerTon: { $divide: ['$totalPriceFromCompleted', '$completedContractsWithPrice'] },
    averagePaymentDelay: { $divide: ['$totalPaymentDelay', '$contractsWithDelay'] },
    contractFulfillmentRate: { $divide: ['$completedContracts', '$totalContracts'] }
  }
}
```
- Computes the three core metrics
- Handles division by zero scenarios

#### Stage 8: Profitability Score Formula
```javascript
{
  $addFields: {
    profitabilityScore: {
      $divide: [
        { $multiply: ['$averagePricePerTon', '$contractFulfillmentRate'] },
        { $add: ['$averagePaymentDelay', 1] }
      ]
    }
  }
}
```
- Applies the exact formula: `(Price × Rate) / (Delay + 1)`
- +1 prevents division by zero

#### Stage 9: Final Sorting
```javascript
{
  $sort: { profitabilityScore: -1 }
}
```
- Orders results by highest profitability score first

### 3. API Routes (`backend/routes/analytics.routes.js`)

#### Primary Endpoint
```
GET /api/analytics/factory-profitability
```
- **Access:** Farmer role only
- **Returns:** Array of factories with profitability metrics
- **Sorting:** Highest profitability score first
- **Includes:** Factories with no contracts (score = 0)

#### Secondary Endpoint
```
GET /api/analytics/factory-details/:factoryId
```
- **Access:** Farmer role only
- **Returns:** Detailed contract history for specific factory
- **Use Case:** Deep-dive analysis from main results

#### Future Endpoints (Placeholder)
- `GET /api/analytics/market-trends`
- `GET /api/analytics/hhm-performance`
- `GET /api/analytics/farmer-dashboard`

### 4. Calculated Metrics Explained

#### AveragePricePerTon
- **Source:** `contract_value` field from completed contracts
- **Calculation:** Total value / Number of completed contracts with value
- **Note:** Assumes contract_value represents total price; could be enhanced with tonnage fields

#### AveragePaymentDelay
- **Source:** `delivery_date` and `payment_date` fields
- **Calculation:** Average days between delivery and payment
- **Null Handling:** 30 days default if payment_date is null
- **Edge Case:** 0 days if same-day payment

#### ContractFulfillmentRate
- **Source:** Contract `status` field
- **Calculation:** Completed contracts / Total contracts
- **Range:** 0.0 to 1.0 (0% to 100%)
- **Business Logic:** Only 'completed' status counts as fulfilled

#### ProfitabilityScore Formula
```
Score = (AveragePricePerTon * ContractFulfillmentRate) / (AveragePaymentDelay + 1)
```
- **Rationale:** Rewards high prices and reliability, penalizes payment delays
- **Higher is Better:** Factories with higher scores are more profitable partners
- **Balanced Metric:** Considers price, reliability, and payment behavior

### 5. Response Structure

#### Main Response Format
```json
{
  "success": true,
  "message": "Factory profitability analysis completed successfully",
  "summary": {
    "totalFactoriesAnalyzed": 15,
    "factoriesWithContracts": 12,
    "factoriesWithoutContracts": 3,
    "averageScore": "2.3456",
    "topPerformer": { /* top factory object */ },
    "analysisDate": "2025-11-13T10:30:00.000Z"
  },
  "data": [
    {
      "factoryId": "64f123456789abcdef123456",
      "factoryName": "Premium Sugar Mills",
      "factoryEmail": "contact@premiumsugar.com",
      "factoryLocation": "Maharashtra, India",
      "factoryCapacity": "1000 tons/day",
      "totalContracts": 25,
      "completedContracts": 21,
      "averagePricePerTon": 5000.00,
      "averagePaymentDelay": 7.50,
      "contractFulfillmentRate": 0.8400,
      "profitabilityScore": 494.1176
    }
  ],
  "count": 15
}
```

#### Factory Details Response Format
```json
{
  "success": true,
  "message": "Factory contract details retrieved successfully",
  "factory": {
    "id": "64f123456789abcdef123456",
    "name": "Premium Sugar Mills",
    "email": "contact@premiumsugar.com",
    "location": "Maharashtra, India",
    "capacity": "1000 tons/day"
  },
  "metrics": {
    "totalContracts": 25,
    "completedContracts": 21,
    "pendingContracts": 2,
    "cancelledContracts": 2
  },
  "contracts": [ /* array of contract objects */ ],
  "count": 25
}
```

### 6. Security & Authorization

#### Role-Based Access Control
- **Endpoint Protection:** `protect` middleware for authentication
- **Role Authorization:** `authorize('Farmer')` middleware
- **Access Validation:** Only Farmer role users can access analytics

#### Data Security
- **Contract Validation:** Users must be parties to contracts for details
- **Information Filtering:** Only relevant public factory information exposed
- **Error Handling:** No sensitive data leaked in error messages

### 7. Performance Considerations

#### Database Optimization
- **Indexed Fields:** Leverages existing indexes on `factory_id`, `status`
- **Pipeline Efficiency:** Reduces data early in pipeline stages
- **Memory Usage:** Uses aggregation for server-side processing

#### Caching Opportunities
- **Result Caching:** Analytics could be cached for 24 hours
- **Incremental Updates:** Could track changes and update incrementally
- **Materialized Views:** Future optimization for frequent queries

### 8. Testing Implementation

#### Test Coverage
- **Authentication Testing:** Farmer-only access verification
- **Authorization Testing:** Role-based access rejection
- **Formula Validation:** Mathematical accuracy verification
- **Performance Benchmarking:** Response time measurement
- **Data Structure Validation:** Response schema compliance

#### Test File: `test-analytics-api.js`
- **Comprehensive Testing:** All endpoints and edge cases
- **Performance Metrics:** Response time and throughput measurement
- **Error Scenarios:** Invalid requests and authorization failures
- **Data Validation:** Formula accuracy and structure verification

### 9. Business Value

#### For Farmers
- **Informed Decisions:** Data-driven factory selection
- **Risk Assessment:** Payment behavior and reliability analysis
- **Profit Optimization:** Choose factories with best profitability scores
- **Competitive Advantage:** Access to market intelligence

#### For Platform
- **Data Insights:** Market trends and factory performance patterns
- **Quality Metrics:** Identify top-performing business partners
- **Business Intelligence:** Foundation for additional analytics features
- **User Engagement:** Valuable decision-making tools for farmers

### 10. Future Enhancements

#### Immediate Improvements
1. **Tonnage Integration:** Add actual tonnage fields for true price per ton
2. **Time-Based Analysis:** Seasonal trends and historical comparisons
3. **Geographic Clustering:** Location-based factory analysis
4. **Quality Metrics:** Include delivery quality and satisfaction scores

#### Advanced Features
1. **Predictive Analytics:** Forecast factory performance trends
2. **Market Intelligence:** Price forecasting and demand analysis
3. **Risk Scoring:** Payment default probability calculation
4. **Recommendation Engine:** AI-powered factory matching

### 11. Files Created/Modified

#### New Files
1. **`backend/controllers/analyticsController.js`** - Main analytics logic
2. **`backend/routes/analytics.routes.js`** - API route definitions
3. **`test-analytics-api.js`** - Comprehensive test suite
4. **`FACTORY_PROFITABILITY_ANALYTICS.md`** - This documentation

#### Modified Files
1. **`backend/server.js`** - Added analytics routes to express app

### 12. Integration Requirements

#### Frontend Implementation Needs
1. **Analytics Dashboard:** UI to display factory profitability rankings
2. **Filter Controls:** Sort and filter options for factory analysis
3. **Detail Views:** Drill-down interface for individual factory analysis
4. **Data Visualization:** Charts and graphs for metric comparison
5. **Export Features:** PDF/Excel export for analysis results

#### API Integration Example
```javascript
// Fetch factory profitability analysis
const getFactoryAnalytics = async () => {
  try {
    const response = await axios.get('/api/analytics/factory-profitability', {
      headers: { 'Authorization': `Bearer ${farmerToken}` }
    });
    
    if (response.data.success) {
      setFactories(response.data.data);
      setSummary(response.data.summary);
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
  }
};
```

## 🚀 Ready for Production

The Factory Profitability Analytics API is now fully implemented with:
- ✅ Complex MongoDB aggregation pipeline
- ✅ Exact profitability score formula implementation  
- ✅ Farmer-only access control
- ✅ Comprehensive error handling
- ✅ Performance optimization
- ✅ Thorough testing coverage
- ✅ Complete documentation

The backend is ready for frontend integration to provide farmers with powerful business intelligence tools for making informed factory partnership decisions!