const logs = document.querySelector('.logs');
const errorLogs = document.querySelector('.error-logs');
const html = document.documentElement;
document.querySelector('.bt').addEventListener('click', handleClick);

function handleClick() {
  $('#main').attr("class","card text-white bg-warning");

  let serviceUuid = '00000000-006b-746c-6165-4861736e694b';
  if (serviceUuid.startsWith('0x')) {
    serviceUuid = parseInt(serviceUuid);
  }

  let characteristicUuid = '00000002-006b-746c-6165-4861736e694b';
  if (characteristicUuid.startsWith('0x')) {
    characteristicUuid = parseInt(characteristicUuid);
  }
  console.log('Bluetooth Requested');
  navigator.bluetooth.requestDevice({
    //acceptAllDevices: true
    filters: [{ services: [serviceUuid] }]
  })
    .then(device => {
      $('#temp').show();
      console.log('connected to ' + device.name);
      return device.gatt.connect();
    }).then(server => server.getPrimaryService(serviceUuid))
    .then(service => {
      console.log('>>');
      return service.getCharacteristic(characteristicUuid);
    })
    .then(characteristic => {
      myCharacteristic = characteristic;
      return myCharacteristic.startNotifications().then(_ => {
        console.log('> Recieving...');
        myCharacteristic.addEventListener('characteristicvaluechanged',
          handleNotifications);
      });
    })
    .catch(error => {
      console.log('Argh! ' + error);
    });
}
function handleNotifications(event) {
  let value = event.target.value;
  let a = [];

  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  for (let i = 0; i < value.byteLength; i++) {
    a.push(('00' + value.getUint8(i).toString(16)).slice(-2));

  }
  if(a.length>=6){
    $('#main').attr("class","card text-white bg-success");
    $('#final-temp').html(
      cToF(
        parseInt((a[2] + a[3]), 16) / 10
      ).toFixed(1)
    );
    $('#temp').hide();
  
  }
  $('#tempy').html(
    cToF(
      parseInt((a[2] + a[3]), 16) / 10
    ).toFixed(1)
  );


  console.log('> ' + a.join(' '));
}
window.onerror = (message, source, line, col, err) => {
  alert(message);
  console.error(message);
};
function cToF(celsius) {
  var cTemp = celsius;
  var cToFahr = cTemp * 9 / 5 + 32;
  var message = cTemp + '\xB0C is ' + cToFahr + ' \xB0F.';
  console.log(message);
  return cToFahr;
}
console.log = (...args) => {
  args.forEach(arg => logs.innerHTML += `${arg}\n`);
};

console.error = (...args) => {
  args.forEach(arg => errorLogs.innerHTML += `${arg}\n`);
};
