const data = [];
const content = document.querySelector('.content');
const countyselect = document.querySelector('.countyselect');
const areaselect = document.querySelector('.areaselect');
const maskcontent = document.querySelector('.maskcontent');
const search = document.querySelector('.search');
const bar = document.querySelector('.bar');
let countydata = [];
let towndata = [];

init();

function init() {
    renderday();
    setmap();
}

function renderday(){
  const date = new Date();
  const day_list = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const today = date.getDay();
  const nowday = day_list[today];
  const ymd = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${(date.getDate()).toString().padStart(2,'0')}`

  let number = '';
  if(today == 2 || today == 4 || today == 6){
    number = '2,4,6,8,0'
  }
  else if(today == 1 || today == 3 || today == 5){
    number = '1,3,5,7,9'
  }
  else{
    number = '都可以'
  };

content.innerHTML = `
  <div>
    <p>${nowday}</p>
    </div>

  <div class='right'>
    <p>${ymd}</p>
    <p>身分字號為<span>${number}</span>可購買</p>
  </div>
`
}

function setmap(){

  const map = L.map('map', {
    center: [25.02347947717578, 121.49247925295343],
    zoom: 18
  });
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  let greenIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

let redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


let yellowIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

let markers = new L.MarkerClusterGroup().addTo(map);

axios.get('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json')
   .then(function(responseText){
    const getdata = responseText.data.features;
    let countyarray = [];
    let townarray = [];

    getdata.forEach(function(k){
        let local = [];
            local.available = k.properties.note;
            local.name = k.properties.name;
            local.add = k.properties.address;
            local.county = k.properties.address.substr(0,3);
            local.town = k.properties.address.substr(0,6);
            local.phone = k.properties.phone;
            local.adult = k.properties.mask_adult;
            local.child = k.properties.mask_child;
            local.lon = k.geometry.coordinates[0]
            local.lat = k.geometry.coordinates[1];

        countyarray.push(local.county);
        townarray.push(local.town);
        data.push(local)
    });
    
    for (let i = 0; data.length > i; i++) {
      let mask;
      if (data[i].adult == 0 && data[i].child == 0) {
          mask = redIcon;
      } else if (data[i].adult !== 0 && data[i].child !== 0) {
          mask = greenIcon;
      } else {
          mask = yellowIcon;
      }

      markers.addLayer(L.marker([data[i].lat, data[i].lon], { icon: mask })
      .bindPopup(
        `
        <div class='farme'>
        <div class='pharmacy'>
          <p>${data[i].name}</p>
          <p>${data[i].add}</p>
          <p>${data[i].phone}</p>
          <p>${data[i].available}</p>
        </div>

        <div class='quantity'>
          <div class='adult'>
            <p>成人口罩</p>
            <p>${data[i].adult}</p>
          </div>
          <div class='child'>
            <p>兒童口罩</p>
            <p>${data[i].child}</p>
          </div>
        </div>
      </div>
    `
      ));

      maskcontent.addEventListener('click', function (e) {
        if (e.target.nodeName === 'A') {
          let lat = e.target.dataset.lat;//緯度
          let lon = e.target.dataset.lon;//經度
          map.setView([lat, lon], 1300)
          // L.popup()
          //       .setLatLng([lat, lon])
          //       .setContent(
          //           `
          //           <div class='farme'>
          //           <div class='pharmacy'>
          //             <p>${e.target.dataset.name}</p>
          //             <p>${e.target.dataset.add}</p>
          //             <p>${e.target.dataset.phone}</p>
          //             <p>${e.target.dataset.available}</p>
          //           </div>
            
          //           <div class='quantity'>
          //             <div class='adult'>
          //               <p>成人口罩</p>
          //               <p>${e.target.dataset.adult}</p>
          //             </div>
          //             <div class='child'>
          //               <p>兒童口罩</p>
          //               <p>${e.target.dataset.child}</p>
          //             </div>
          //           </div>
          //         </div>
          //           `
          //           )
          //       .openOn(map);
        }
      });
    }

    countyarray = [...new Set(countyarray)];
    townarray  = [...new Set(townarray)];

    countyarray.forEach(function(k){
        const opt = document.createElement('OPTION');
        opt.textContent = k.substr(0,3);
        countyselect.appendChild(opt);
    });

    countyselect.addEventListener('change',function(e){
        if(e.target.value == '- - 請選擇市區 - -'){
            areaselect.style.display='none'
        }
        else{
            areaselect.style.display='block'
            areaselect.innerHTML = `<option>- - 請選擇地區 - -</option>`;
        }
        townarray.forEach(function(k){
            if(e.target.value === k.substr(0,3)){
                const opt = document.createElement('OPTION');
                opt.textContent = k.substr(3,3);
                areaselect.appendChild(opt);
            }
        })

        countydata = []
        towndata = []

        data.forEach(function(k){
            if(e.target.value == k.county){
                countydata.push(k)
            }

            // countydata.forEach(function(k){
            //     if(e.target.value !== k.county){
            //         countydata = [];
            //     }
            // })
            datarow(countydata)
            datarow(towndata)
        })
    },false);

    areaselect.addEventListener('change',function(e){
      
        countydata = []
        towndata = []

        data.forEach(function(k){
            if(e.target.value == k.town.substr(3,3)){
                towndata.push(k)
            }

            datarow(countydata)
            datarow(towndata)
        })
    },false)

    bar.addEventListener('click',function(e){
        let str = search.value;

        countydata = []
        towndata = []

        data.forEach(function(k){
            // if(str == k.town.substr(0,2) || str == k.town.substr(0,3)){
            //     countydata.push(k)
            // }
            if(str == k.town.substr(3,2) || str == k.town.substr(3,3) || str == k.name.substr(0,1) || str == k.name.substr(0,2)){
                towndata.push(k)
            }

            datarow(countydata)
            datarow(towndata)
        })
    },false)
   })
}

function datarow(){
    let str = '';
    // for(let i = 0 ; i < countydata.length ;i++){
    //     str+=`
    //       <p>${countydata[i].name}</p>
    //       <p>${countydata[i].add}</p>
    //       <p>${countydata[i].phone}</p>
    //     `
    // }
    for(let i = 0 ; i < towndata.length ;i++){
            str+=`
            <div class='farme'>
              <div class='pharmacy'>
                <a href='#' data-lat='${towndata[i].lat}' data-lon='${towndata[i].lon}' data-name='${towndata[i].name}' 
                data-phone='${towndata[i].phone}' data-adult='${towndata[i].adult}' data-child='${towndata[i].child}' 
                data-available='${towndata[i].available}' data-add='${towndata[i].add}'>${towndata[i].name}</a>
                <p>${towndata[i].add}</p>
                <p>${towndata[i].phone}</p>
                <p>${towndata[i].available}</p>
              </div>

              <div class='quantity'>
                <div class='adult'>
                  <p>成人口罩</p>
                  <p>${towndata[i].adult}</p>
                </div>
                <div class='child'>
                  <p>兒童口罩</p>
                  <p>${towndata[i].child}</p>
                </div>
              </div>
            </div>
          `
          }  
    maskcontent.innerHTML = str

 };

 $(document).ready(function(){
    $('.toggle a').click(function(e){
        e.preventDefault();
        $('.wrap,#map').toggleClass('move')
        $('.toggle a').toggleClass('fa-solid fa-angle-left').toggleClass('fa-solid fa-chevron-right');
    })
 })



