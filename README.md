### Installation

```bash
npm install @fort-capital/etl-transformer-core
```

or

```bash
yarn add @fort-capital/etl-transformer-core
```

### Usage

```javascript
import { GCloudPubSubTransformer } from "@fort-capital/etl-transformer-core";

const transformer = GCloudPubSubTransformer({
    datalake: 'datalake-bucket',
    staging: 'staging-bucket',
    topic: 'pubsub-topic-for-logging',
    service: 'service-name',
    method: 'method-name',
    table: 'table-name',
});

transformer.extractRecords((records) => {
    // transform records
    return records
});

exports[transformer.name] = transformer.handler
```
