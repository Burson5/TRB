const delay = (func, time) => {
  setTimeout(() => {
    func();
  }, time);
};

export default delay;
