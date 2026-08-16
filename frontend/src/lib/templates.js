/**
 * Pre-built engineering note templates for the author studio.
 * Helps authors scaffold rich, multi-slide technical deep dives in 1 click.
 */

export const NOTE_TEMPLATES = [
  {
    id: 'architecture-deep-dive',
    title: 'System Architecture Deep Dive',
    tagline: 'Multi-slide architectural analysis with system diagrams, code, and trade-offs.',
    category: 'System Design',
    icon: 'Layers',
    defaultTitle: 'Distributed Cache & Invalidation Architecture',
    defaultExcerpt: 'Deep dive into distributed cache invalidation strategies, two-phase commits, and high-throughput cache-aside patterns.',
    defaultTagIds: [5], // System Design
    slides: [
      {
        orderNumber: 1,
        title: 'System Overview & Problem Statement',
        blocks: [
          { type: 'heading', level: 2, content: 'System Overview & Problem Statement' },
          { type: 'paragraph', content: 'In high-scale microservices, database reads become the primary scalability bottleneck. A distributed caching layer reduces database load by up to **90%**, but introduces cache invalidation challenges.' },
          {
            type: 'diagram',
            content: 'graph LR\n    Client[Client Request] --> API[API Gateway]\n    API --> Cache[(Redis Cluster)]\n    API --> DB[(PostgreSQL Primary)]\n    Cache -. Cache Miss .-> DB',
          },
          { type: 'callout', variant: 'tip', content: 'Key Rule: Always define a strict TTL and single source of truth before introducing caching.' },
        ],
      },
      {
        orderNumber: 2,
        title: 'Cache-Aside Implementation Pattern',
        blocks: [
          { type: 'heading', level: 2, content: 'Cache-Aside Implementation Pattern' },
          { type: 'paragraph', content: 'The Cache-Aside (Lazy Loading) pattern ensures data is only fetched from the database on a cache miss.' },
          {
            type: 'code',
            language: 'csharp',
            content: 'public async Task<UserProfile> GetUserAsync(int userId)\n{\n    var cacheKey = $"user:{userId}";\n    var cached = await _cache.GetStringAsync(cacheKey);\n    if (cached != null)\n        return JsonSerializer.Deserialize<UserProfile>(cached);\n\n    var user = await _db.Users.FindAsync(userId);\n    if (user != null)\n        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(user), TimeSpan.FromMinutes(10));\n\n    return user;\n}',
          },
          {
            type: 'steps',
            title: 'Execution Flow',
            items: [
              'Check Redis cache using a deterministic key.',
              'If found (cache hit), deserialize and return immediately.',
              'If missing (cache miss), query database primary.',
              'Populate cache with a safe TTL (e.g. 10 minutes) and return.',
            ],
          },
        ],
      },
      {
        orderNumber: 3,
        title: 'Invalidation Strategies & Trade-offs',
        blocks: [
          { type: 'heading', level: 2, content: 'Invalidation Strategies & Trade-offs' },
          {
            type: 'table',
            caption: 'Comparison of Invalidation Approaches',
            headers: ['Strategy', 'Consistency', 'Latency', 'Complexity'],
            rows: [
              ['TTL Expiration', 'Eventual (Bounded)', 'Ultra-Low', 'Low'],
              ['Write-Through', 'Strong', 'Medium', 'Medium'],
              ['CDC (Debezium/Kafka)', 'Eventual (Sub-second)', 'Low', 'High'],
            ],
            striped: true,
            bordered: true,
          },
          {
            type: 'keyvalue',
            title: 'Architectural Decisions',
            layout: 'list',
            pairs: [
              { key: 'Eviction Policy', value: 'volatile-lru (removes least recently used keys with TTL)' },
              { key: 'Cache Stampede Prevention', value: 'Mutex / Distributed Lock or Probabilistic Early Expiration' },
            ],
          },
        ],
      },
      {
        orderNumber: 4,
        title: 'Knowledge Check',
        blocks: [
          { type: 'heading', level: 2, content: 'Knowledge Check' },
          {
            type: 'quiz',
            question: 'What is the primary risk of using Cache-Aside without locking during traffic spikes?',
            options: [
              'Cache Stampede (Thundering Herd) where multiple requests hit the DB simultaneously',
              'Memory leak in the Redis cluster',
              'Immediate database failover',
              'Loss of data persistence in the primary database',
            ],
            answer: 0,
            explanation: 'When a popular cache key expires during high traffic, hundreds of concurrent requests will miss the cache simultaneously and overwhelm the database. This is known as the Thundering Herd / Cache Stampede problem.',
          },
        ],
      },
    ],
  },
  {
    id: 'dsa-algorithm-breakdown',
    title: 'Algorithm & Data Structure (DSA)',
    tagline: 'Clean problem formulation, visual step-by-step logic, code, and Big-O complexity analysis.',
    category: 'DSA',
    icon: 'Code',
    defaultTitle: 'Binary Search Tree: In-Order Traversal & Balancing',
    defaultExcerpt: 'Essential patterns for binary tree traversals, tree height calculations, and balanced search tree mechanics.',
    defaultTagIds: [3], // DSA
    slides: [
      {
        orderNumber: 1,
        title: 'Problem Definition & Intuition',
        blocks: [
          { type: 'heading', level: 2, content: 'Problem Definition & Intuition' },
          { type: 'paragraph', content: 'A **Binary Search Tree (BST)** satisfies the invariant that all nodes in the left subtree are smaller than the root, and all nodes in the right subtree are greater.' },
          {
            type: 'diagram',
            content: 'graph TD\n    A((10)) --> B((5))\n    A --> C((15))\n    B --> D((2))\n    B --> E((8))\n    C --> F((12))\n    C --> G((20))',
          },
          { type: 'callout', variant: 'info', content: 'In-Order Traversal (Left -> Root -> Right) of a BST always yields values in strictly sorted ascending order.' },
        ],
      },
      {
        orderNumber: 2,
        title: 'Recursive & Iterative Traversal',
        blocks: [
          { type: 'heading', level: 2, content: 'Recursive & Iterative Traversal' },
          {
            type: 'code',
            language: 'csharp',
            content: 'public void InOrderTraversal(TreeNode root, List<int> result)\n{\n    if (root == null) return;\n    \n    InOrderTraversal(root.Left, result);  // 1. Visit Left\n    result.Add(root.Value);               // 2. Process Current\n    InOrderTraversal(root.Right, result); // 3. Visit Right\n}',
          },
          {
            type: 'steps',
            title: 'Traversal Order for Above Tree',
            items: [
              'Visit Node 2 (Left-most leaf)',
              'Visit Node 5 (Parent)',
              'Visit Node 8 (Right child of 5)',
              'Visit Node 10 (Root)',
              'Visit Node 12, Node 15, Node 20',
              'Final Output: [2, 5, 8, 10, 12, 15, 20]',
            ],
          },
        ],
      },
      {
        orderNumber: 3,
        title: 'Complexity & Practice Check',
        blocks: [
          { type: 'heading', level: 2, content: 'Complexity & Practice Check' },
          {
            type: 'keyvalue',
            title: 'Complexity Analysis',
            layout: 'list',
            pairs: [
              { key: 'Time Complexity', value: 'O(N) — Every node is visited exactly once' },
              { key: 'Space Complexity (Balanced)', value: 'O(log N) — Call stack height is proportional to tree height' },
              { key: 'Space Complexity (Skewed)', value: 'O(N) — Degenerates to linked list in worst case' },
            ],
          },
          {
            type: 'quiz',
            question: 'What is the time complexity of searching in a completely unbalanced (skewed) binary search tree?',
            options: ['O(N)', 'O(log N)', 'O(1)', 'O(N log N)'],
            answer: 0,
            explanation: 'In a skewed BST (e.g. inserting elements already in sorted order), the tree degenerates into a single line (like a linked list), making search O(N).',
          },
        ],
      },
    ],
  },
  {
    id: 'code-pattern-refactoring',
    title: 'Code Pattern & Refactoring',
    tagline: 'Side-by-side anti-pattern vs clean code pattern, trade-offs, and implementation steps.',
    category: 'Design Patterns',
    icon: 'Sparkles',
    defaultTitle: 'Refactoring: Eliminating Switch Statements with Strategy Pattern',
    defaultExcerpt: 'How to replace brittle, open-ended switch-case blocks with clean, extensible Strategy pattern handlers.',
    defaultTagIds: [1, 2], // C#, .NET
    slides: [
      {
        orderNumber: 1,
        title: 'The Anti-Pattern (Brittle Switch Statement)',
        blocks: [
          { type: 'heading', level: 2, content: 'The Anti-Pattern (Brittle Switch Statement)' },
          { type: 'paragraph', content: 'As business logic grows, large switch statements violate the **Open/Closed Principle (OCP)**. Every new requirement requires modifying existing methods.' },
          {
            type: 'code',
            language: 'csharp',
            content: '// ❌ Brittle: Adding a new payment type requires modifying this class\npublic decimal CalculateDiscount(PaymentType type, decimal amount)\n{\n    switch (type)\n    {\n        case PaymentType.CreditCard:\n            return amount * 0.02m;\n        case PaymentType.Crypto:\n            return amount * 0.05m;\n        case PaymentType.BankTransfer:\n            return 0;\n        default:\n            throw new ArgumentOutOfRangeException();\n    }\n}',
          },
          { type: 'callout', variant: 'warning', content: 'Smell: Any change to payment rules risks breaking existing unrelated discount logic.' },
        ],
      },
      {
        orderNumber: 2,
        title: 'The Refactored Solution (Strategy Pattern)',
        blocks: [
          { type: 'heading', level: 2, content: 'The Refactored Solution (Strategy Pattern)' },
          { type: 'paragraph', content: 'Encapsulate each discount calculation inside its own dedicated strategy class implementing a common interface.' },
          {
            type: 'code',
            language: 'csharp',
            content: 'public interface IDiscountStrategy\n{\n    PaymentType SupportedType { get; }\n    decimal Calculate(decimal amount);\n}\n\npublic class CryptoDiscountStrategy : IDiscountStrategy\n{\n    public PaymentType SupportedType => PaymentType.Crypto;\n    public decimal Calculate(decimal amount) => amount * 0.05m;\n}',
          },
          { type: 'callout', variant: 'tip', content: 'Benefit: Adding a new discount strategy is as simple as adding a new class — no modifications to existing code!' },
        ],
      },
      {
        orderNumber: 3,
        title: 'Key Takeaways & Summary',
        blocks: [
          { type: 'heading', level: 2, content: 'Key Takeaways & Summary' },
          {
            type: 'steps',
            title: 'Refactoring Steps',
            items: [
              'Define a domain interface (e.g. IDiscountStrategy).',
              'Create separate concrete strategy classes for each branch.',
              'Register strategies with dependency injection as IEnumerable<IDiscountStrategy>.',
              'Resolve strategies dynamically using a Factory or Dictionary lookup.',
            ],
          },
          {
            type: 'quiz',
            question: 'Which SOLID principle is directly upheld by replacing switch statements with the Strategy pattern?',
            options: [
              'Open/Closed Principle (OCP)',
              'Single Responsibility Principle only',
              'Interface Segregation only',
              'Liskov Substitution only',
            ],
            answer: 0,
            explanation: 'The Open/Closed Principle states that software entities should be open for extension, but closed for modification. New strategies extend behavior without editing existing code.',
          },
        ],
      },
    ],
  },
  {
    id: 'api-specification-flow',
    title: 'API Design & Microservice Flow',
    tagline: 'Endpoint contract, sequence diagrams, request/response models, and error resiliency.',
    category: '.NET / Cloud',
    icon: 'Terminal',
    defaultTitle: 'Idempotent API Design with Idempotency Keys',
    defaultExcerpt: 'Designing bulletproof payment and order creation endpoints that prevent duplicate charges under network retries.',
    defaultTagIds: [2, 4], // .NET Core, SQL
    slides: [
      {
        orderNumber: 1,
        title: 'Idempotency Problem & Sequence Flow',
        blocks: [
          { type: 'heading', level: 2, content: 'Idempotency Problem & Sequence Flow' },
          { type: 'paragraph', content: 'Network timeouts between the client and API can cause duplicate HTTP POST retries. Without idempotency keys, users can be charged multiple times.' },
          {
            type: 'diagram',
            content: 'sequenceDiagram\n    autonumber\n    Client->>API: POST /orders (Idempotency-Key: abc-123)\n    API->>DB: Check if abc-123 exists\n    alt Key exists\n        API-->>Client: Return cached 200 OK result\n    else New Key\n        API->>PaymentGW: Process Charge\n        API->>DB: Save Order & Key\n        API-->>Client: Return 201 Created\n    end',
          },
        ],
      },
      {
        orderNumber: 2,
        title: 'Database Schema & Idempotency Storage',
        blocks: [
          { type: 'heading', level: 2, content: 'Database Schema & Idempotency Storage' },
          {
            type: 'code',
            language: 'sql',
            content: 'CREATE TABLE idempotency_keys (\n    id TEXT PRIMARY KEY,\n    user_id INTEGER NOT NULL,\n    request_hash TEXT NOT NULL,\n    response_code INTEGER NOT NULL,\n    response_body TEXT NOT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    expires_at DATETIME NOT NULL\n);\n\nCREATE INDEX idx_idempotency_expiry ON idempotency_keys(expires_at);',
          },
          {
            type: 'keyvalue',
            title: 'HTTP Header Standards',
            layout: 'list',
            pairs: [
              { key: 'Header Name', value: 'Idempotency-Key (UUIDv4)' },
              { key: 'Lock TTL', value: '120 seconds during processing' },
              { key: 'Result Cache TTL', value: '24 hours' },
            ],
          },
        ],
      },
      {
        orderNumber: 3,
        title: 'Summary & Practice Check',
        blocks: [
          { type: 'heading', level: 2, content: 'Summary & Practice Check' },
          {
            type: 'callout',
            variant: 'tip',
            content: 'Rule of Thumb: For write operations (POST/PATCH), always pair distributed locks with an idempotency ledger table in the database transaction.',
          },
          {
            type: 'quiz',
            question: 'What HTTP status code should be returned if a concurrent request with the same Idempotency-Key is still actively processing?',
            options: ['409 Conflict', '500 Internal Server Error', '404 Not Found', '200 OK'],
            answer: 0,
            explanation: 'HTTP 409 Conflict (or 429) indicates that another request with the exact same idempotency key is already currently in flight and cannot be processed concurrently.',
          },
        ],
      },
    ],
  },
];
