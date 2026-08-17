-- Kadha Simplified Seed Data (v3.0)

INSERT OR REPLACE INTO userprofiles (id, email, password, name, profileUrl, bio, githubUrl, twitterUrl, role)
VALUES (
  1,
  'author@kadha.io',
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', -- SHA-256 hash of 'password123'
  'Phaneendra',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  'Software Engineer & Systems Architect studying C#, .NET, DSA, and SQL.',
  'https://github.com',
  'https://x.com',
  'admin'
);

INSERT OR IGNORE INTO tags (id, name) VALUES
  (1, 'C#'),
  (2, '.NET Core'),
  (3, 'DSA'),
  (4, 'SQL'),
  (5, 'System Design');

-- Lesson 1: C# Async/Await
INSERT OR REPLACE INTO lessons (id, title, slug, excerpt, imageUrl, readingTime, slidesCount, isPublished, viewsCount) VALUES (
  1,
  'C# Async/Await & SynchronizationContext Deep Dive',
  'csharp-async-await-synchronization-context-deep-dive',
  'Understanding how task-based asynchronous pattern (TAP) works under the hood in C# and .NET 8, including SynchronizationContext and TaskScheduler behavior.',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
  4,
  2,
  1,
  280
);

-- Slides for Lesson 1
INSERT OR REPLACE INTO slides (lessonId, orderNumber, title, blocksJson) VALUES 
(
  1,
  1,
  'Understanding Async/Await State Machine',
  '[{"type":"heading","content":"Understanding Async/Await in C#"},{"type":"paragraph","content":"In C#, async and await are compiler transformations that generate an IAsyncStateMachine struct under the hood."},{"type":"code","language":"csharp","content":"public async Task<UserData> FetchUserAsync(int userId)\n{\n    // Execution thread is yielded to ThreadPool while awaiting\n    var json = await _httpClient.GetStringAsync($\"/users/{userId}\");\n    return JsonSerializer.Deserialize<UserData>(json);\n}"},{"type":"callout","content":"Key Takeaway: Awaiting an incomplete Task yields the current thread back to the ThreadPool."}]'
),
(
  1,
  2,
  'ConfigureAwait(false) & ThreadPool Resumption',
  '[{"type":"heading","content":"ConfigureAwait(false) & ThreadPool Resumption"},{"type":"paragraph","content":"In non-UI applications like ASP.NET Core API endpoints, using ConfigureAwait(false) prevents capturing the SynchronizationContext."},{"type":"code","language":"csharp","content":"var data = await ReadDatabaseAsync().ConfigureAwait(false);"},{"type":"quiz","question":"What does ConfigureAwait(false) do in C#?","options":["Bypasses capturing the current SynchronizationContext","Cancels the running Task immediately","Forces execution on UI thread"],"answer":0,"explanation":"ConfigureAwait(false) tells the runtime that resuming execution does not require returning to the captured SynchronizationContext."}]'
);

-- Lesson 2: Binary Tree Traversals
INSERT OR REPLACE INTO lessons (id, title, slug, excerpt, imageUrl, readingTime, slidesCount, isPublished, viewsCount) VALUES (
  2,
  'Data Structures & Algorithms: Binary Tree Traversals & Complexity',
  'dsa-binary-tree-traversals-complexity',
  'Essential algorithmic patterns for In-Order, Pre-Order, Post-Order, and Level-Order BFS traversal in Binary Search Trees (BST).',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
  4,
  2,
  1,
  310
);

-- Slides for Lesson 2
INSERT OR REPLACE INTO slides (lessonId, orderNumber, title, blocksJson) VALUES 
(
  2,
  1,
  'Binary Tree In-Order Traversal',
  '[{"type":"heading","content":"Binary Tree In-Order Traversal"},{"type":"paragraph","content":"In-Order traversal (Left -> Node -> Right) visits nodes of a Binary Search Tree in sorted ascending order."},{"type":"code","language":"csharp","content":"public void InOrder(TreeNode root) {\n    if (root == null) return;\n    InOrder(root.Left);\n    Console.WriteLine(root.Value);\n    InOrder(root.Right);\n}"},{"type":"callout","content":"Time Complexity: O(N) where N is number of nodes. Space Complexity: O(H) where H is tree height."}]'
),
(
  2,
  2,
  'Level-Order BFS Traversal',
  '[{"type":"heading","content":"Level-Order BFS Traversal (Queue Pattern)"},{"type":"paragraph","content":"Level-order traversal uses a FIFO Queue to visit nodes level-by-level from top to bottom."},{"type":"diagram","content":"graph TD\n    A((10)) --> B((5))\n    A --> C((15))\n    B --> D((2))\n    B --> E((7))\n    C --> F((12))"}]'
);

-- Lesson 3: SQL B-Tree Indexing
INSERT OR REPLACE INTO lessons (id, title, slug, excerpt, imageUrl, readingTime, slidesCount, isPublished, viewsCount) VALUES (
  3,
  'SQL Query Optimization & B-Tree Index Mechanics',
  'sql-query-optimization-btree-index-mechanics',
  'How B-Tree clustered vs non-clustered indexes work in SQL Server, PostgreSQL, and SQLite, and how to eliminate full table scans.',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200',
  3,
  1,
  1,
  190
);

-- Slides for Lesson 3
INSERT OR REPLACE INTO slides (lessonId, orderNumber, title, blocksJson) VALUES 
(
  3,
  1,
  'Clustered vs Non-Clustered Indexes',
  '[{"type":"heading","content":"Clustered vs Non-Clustered Indexes"},{"type":"paragraph","content":"Clustered Index defines the physical storage order on disk. Non-Clustered Index is a secondary B-Tree pointing to row IDs."},{"type":"code","language":"sql","content":"CREATE INDEX IX_Orders_CustomerId_Status \nON Orders(CustomerId, Status) \nINCLUDE (OrderDate, TotalAmount);"},{"type":"callout","content":"Indexing Golden Rule: Order columns in composite index from highest selectivity to lower selectivity."}]'
);

INSERT OR IGNORE INTO tagsonlessons (lessonId, tagId) VALUES
  (1, 1),
  (1, 2),
  (2, 3),
  (3, 4);
