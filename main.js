import './style.css'
import products from './products.json';
import { generateQ, sound, imgToTs } from './utils';
import dingFile from './ding.mp3?base64';
const ding = sound(dingFile);

const $ = (selector, parent = document) => parent.querySelector(selector);
const $on = ($elem, event, handler) => $elem.addEventListener(event, handler);

const $status = $('#status');
const $info = $('#info');
const $result = $('#result');

const $form = $('#form');
const $time = $('[name="time"]', $form);
const $productsGroup = $('[name=productsgroup]', $form);
const $group = $('[name=group]', $form);


const getProductImages = (id = 4958276) => new Promise((resolve) => {
  fetch(`https://sirius.digikala.com/v1/product/${id}/`)
    .then((res) => res.json())
    .then((res) => res.data.product.images.image_list)
    .then(resolve)
    .catch(() => resolve([]))
})

const start = (crowlingProducts, newerThanTs) => {
  const q = generateQ();

  const allCrowlers = [];
  crowlingProducts.forEach((productId) => {
    allCrowlers.push(q(() => getProductImages(productId).then((images) => {
      const newImages = images.filter((image) => imgToTs(image) >= newerThanTs);
      if (newImages.length) {
        ding.play();
        newImages.forEach((newImage) => {
          $result.innerHTML += `
            <div>
              <a href="${newImage}" target="blank"> Link </a>
              <img src="${newImage} alt="${newImage}"/>
            </div>
          `.trim();
        });
      }
      return images;
    })));
  });
  Promise.all(allCrowlers).finally(() => {
    $status.innerHTML = Number($status.innerHTML.trim()) + 1;
    start(crowlingProducts, newerThanTs);
  });
};

$on($form, 'submit', (e) => {
  e.preventDefault();
  const productsGroup = Number($productsGroup.value);
  const group = Number($group.value);
  const time = new Date();
  const [h,m] = $time.value.split(':').map(x => Number(x));
  time.setMilliseconds(0);
  time.setSeconds(0);
  time.setMinutes(m);
  time.setHours(h);
  
  const size = Math.ceil(products.length / productsGroup);
  const from = (group - 1) * size;
  const to = group * size;
  $info.innerHTML = `
  Crowling Products: ${size}<br />
  From Product ${from} To ${to}<br />
  Images Should Newer Than ${time.toTimeString()} 
  `.trim();
  const startNow = confirm('Start now?');
  if (!startNow) return;
  $result.innerHTML = '';
  $status.innerHTML = '';
  ding.play();
  $status.innerHTML = 0;
  $status.style.display = 'block';
  $form.remove();
  const crowlingProducts = products.slice(from, to);
  start(crowlingProducts, time.getTime());
});