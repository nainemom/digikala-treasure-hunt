export const sound = (src) => {
  const el = document.createElement('audio');
  el.src = src;
  el.setAttribute('preload', 'auto');
  el.setAttribute('controls', 'none');
  el.style.display = 'none';
  document.body.appendChild(el);
  return {
    play: () => el.play(),
    stop: () => el.stop()
  }
}


export const generateQ = () => {
  let qJobs = [];
  let qRunning = false;
  const qTimer = (calledByQ = true) => {
    qRunning = true;
    const job = qJobs[0];
    if (job) {
      qJobs = [
        ...qJobs.slice(1),
      ];
      job.func().then(job.resolve).catch(job.reject).finally((x) => {
        if (qJobs.length) {
          qTimer(true);
        } else {
          qRunning = false;
        }
        return x;
      });
    }
  };

  return (func) => new Promise((resolve, reject) => {
    qJobs = [
      ...qJobs,
      {
        func,
        resolve: (x) => resolve(x),
        reject: (x) => reject(x),
      },
    ];
    if (!qRunning) {
      qTimer(true);
    }
  });
};

export const imgToTs = (url) => Number(((url.match(/(\d+)\.jpg/g) || [])[0] || '').slice(0, -4)) * 1000;
