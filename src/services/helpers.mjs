export const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

export const pace = (func, pace = 300) => {
  let timer, lastRun = 0;
  return (...args) => {
    clearTimeout(timer);
    const now = Date.now();
    if ((now - lastRun) > pace) {
      func.apply(this, args);
      lastRun = now;
    }
    timer = setTimeout(() => { func.apply(this, args); }, pace);
  };
}

