const url = `http://127.0.0.1:${process.env.PORT ?? 3002}/health`;

try {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Unexpected status: ${res.status}`);
  }
  process.exit(0);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

export {};
