import { TYPE_LOCALITY, TYPE_NODE } from './nodes';

const nodeTree = {
  type: TYPE_LOCALITY,
  name: 'Cluster',
  children: [
    {
      type: TYPE_LOCALITY,
      name: 'US',
      children: [
        {
          type: TYPE_LOCALITY,
          name: 'us-east',
          cityName: 'Washington, D.C.',
          children: [
            {
              type: TYPE_LOCALITY,
              name: 'us-east-1a',
              children: [
                {
                  type: TYPE_NODE,
                  name: '10.123.43.4',
                  stats: {
                    CPU: Math.random() * 100,
                    QPS: Math.random() * 50,
                    gbUsed: Math.random() * 256,
                    gbCapacity: 256,
                    ranges: Math.round(Math.random() * 1000)
                  }
                },
                {
                  type: TYPE_NODE,
                  name: '10.123.43.5',
                  stats: {
                    CPU: 34,
                    QPS: Math.random() * 50,
                    gbUsed: Math.random() * 256,
                    gbCapacity: 256,
                    ranges: Math.round(Math.random() * 1000)
                  }
                },
              ]
            },
            {
              type: TYPE_LOCALITY,
              name: 'us-east-1b',
              children: [
                {
                  type: TYPE_NODE,
                  name: '10.123.43.6',
                  stats: {
                    CPU: 34,
                    QPS: Math.random() * 50,
                    gbUsed: Math.random() * 256,
                    gbCapacity: 256,
                    ranges: Math.round(Math.random() * 1000)
                  }
                },
                {
                  type: TYPE_NODE,
                  name: '10.123.43.7',
                  stats: {
                    CPU: 34,
                    QPS: Math.random() * 50,
                    gbUsed: Math.random() * 256,
                    gbCapacity: 256,
                    ranges: Math.round(Math.random() * 1000)
                  }
                },
              ]
            }
          ]
        },
        {
          type: TYPE_LOCALITY,
          name: 'us-west',
          cityName: 'Seattle',
          children: [
            {
              type: TYPE_LOCALITY,
              name: 'us-west-1a',
              children: [
                {
                  type: TYPE_NODE,
                  name: '10.123.43.57',
                  stats: {
                    CPU: Math.random() * 100,
                    QPS: Math.random() * 50,
                    gbUsed: Math.random() * 256,
                    gbCapacity: 256,
                    ranges: Math.round(Math.random() * 1000)
                  }
                },
                {
                  type: TYPE_NODE,
                  name: '10.123.43.58',
                  stats: {
                    CPU: Math.random() * 100,
                    QPS: Math.random() * 50,
                    gbUsed: Math.random() * 256,
                    gbCapacity: 256,
                    ranges: Math.round(Math.random() * 1000)
                  }
                },
              ]
            }
          ]
        }
      ]
    },
    {
      type: TYPE_LOCALITY,
      name: 'EU',
      children: [
        {
          type: TYPE_LOCALITY,
          name: 'eu-east',
          cityName: 'Berlin',
          children: [
            {
              type: TYPE_LOCALITY,
              name: 'eu-east-1a',
              children: [
                {
                  type: TYPE_NODE,
                  name: '10.123.43.8',
                  stats: {
                    CPU: Math.random() * 100,
                    QPS: Math.random() * 50,
                    gbUsed: Math.random() * 256,
                    gbCapacity: 256,
                    ranges: Math.round(Math.random() * 1000)
                  }
                },
                {
                  type: TYPE_NODE,
                  name: '10.123.43.9',
                  stats: {
                    CPU: Math.random() * 100,
                    QPS: Math.random() * 50,
                    gbUsed: Math.random() * 256,
                    gbCapacity: 256,
                    ranges: Math.round(Math.random() * 1000)
                  }
                },
              ]
            },
            {
              type: TYPE_LOCALITY,
              name: 'eu-east-1b',
              children: [
                {
                  type: TYPE_NODE,
                  name: '10.123.43.10',
                  stats: {
                    CPU: Math.random() * 100,
                    QPS: Math.random() * 50,
                    gbUsed: Math.random() * 256,
                    gbCapacity: 256,
                    ranges: Math.round(Math.random() * 1000)
                  }
                },
                {
                  type: TYPE_NODE,
                  name: '10.123.43.11',
                  stats: {
                    CPU: Math.random() * 100,
                    QPS: Math.random() * 50,
                    gbUsed: Math.random() * 256,
                    gbCapacity: 256,
                    ranges: Math.round(Math.random() * 1000)
                  }
                },
              ]
            }
          ]
        }
      ]
    },
    {
      type: TYPE_LOCALITY,
      name: 'JP',
      cityName: 'Tokyo',
      children: [
        {
          type: TYPE_NODE,
          name: '12.42.56.128',
          stats: {
            CPU: Math.random() * 100,
            QPS: Math.random() * 50,
            gbUsed: Math.random() * 256,
            gbCapacity: 256,
            ranges: Math.round(Math.random() * 1000)
          }
        }
      ]
    }
  ]
};

export default nodeTree;
