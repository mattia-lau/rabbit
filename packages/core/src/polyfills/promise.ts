Promise.chain = async <T>(promises: any[]) => {
  const res = [];
  for (const promise of promises) {
    res.push(await promise);
  }

  return res;
};
