module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Transaction Import Tool API",
    version: "1.0.0",
    description: "CSV transaction import with a Maker-Checker approval flow.",
  },
  servers: [{ url: "http://localhost:3000" }],
  paths: {
    "/health": {
      get: { summary: "Check API health", responses: { 200: { description: "API is running" } } },
    },
    "/upload": {
      post: {
        summary: "Upload a CSV file as a maker",
        parameters: [{ $ref: "#/components/parameters/UserHeader" }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: { file: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: { 201: { description: "Batch created" }, 400: { $ref: "#/components/responses/BadRequest" } },
      },
    },
    "/batches": {
      get: { summary: "List batches", responses: { 200: { description: "Batch list" } } },
    },
    "/batches/{id}": {
      get: {
        summary: "Get a batch and its transactions",
        parameters: [{ $ref: "#/components/parameters/BatchId" }],
        responses: { 200: { description: "Batch detail" }, 400: { $ref: "#/components/responses/BadRequest" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
    },
    "/batches/{id}/approve": {
      post: {
        summary: "Authorize every pending transaction in a batch",
        parameters: [
          { $ref: "#/components/parameters/BatchId" },
          { $ref: "#/components/parameters/UserHeader" },
        ],
        responses: { 200: { description: "Batch approved" }, 400: { $ref: "#/components/responses/BadRequest" }, 404: { $ref: "#/components/responses/NotFound" }, 409: { description: "Batch cannot be approved" } },
      },
    },
    "/audit-logs": {
      get: {
        summary: "List audit logs, newest first",
        parameters: [
          { name: "batchId", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "action", in: "query", schema: { type: "string", enum: ["UPLOAD", "APPROVE"] } },
        ],
        responses: { 200: { description: "Audit log list" }, 400: { $ref: "#/components/responses/BadRequest" } },
      },
    },
  },
  components: {
    parameters: {
      BatchId: { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } },
      UserHeader: { name: "x-user", in: "header", schema: { type: "string" }, description: "Maker or checker name" },
    },
    responses: {
      BadRequest: { description: "Invalid request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      NotFound: { description: "Resource not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
    },
    schemas: {
      Error: { type: "object", properties: { error: { type: "string" } } },
    },
  },
};
