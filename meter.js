// Maximum transmit power
function onInit() {
    NRF.setTxPower(4);
}

var counter = 0;
var counterkWh = 0;

var lastpulse = Math.floor(Date.now());
var currentTime = Math.floor(Date.now()) / 1000;

var pulsetime = 0;

// energy variable will be actual kWh * 1000 in order for BTHome to parse to 3 decimal places
var energy = 0;

// power variable will be actual watts * 100 in order for BTHome to parse to 2 decimal places
var power = 0;

// Update BLE advertising
function update()   {
NRF.setAdvertising([
  [
0x02,0x01,0x06,
0x05,0x09,0x50,0x75,0x63,0x6B,
0x0E,0x16,0xD2,0xFC,0x40,0x01,Puck.getBatteryPercentage(),0x0A,energy,energy>>8,energy>>16,0x0B,power,power>>8,power>>16,
]]);
}

function calculateData() {
    // Pulse green LED
    // digitalPulse(LED2,1,1);
    pulsetime = ( Math.floor(Date.now()) - lastpulse ) / 1000;
    pulsetime = pulsetime / 10;
    // POWER = W
    // ENERGY = kWh
    // W = 3600 / (imp/kWh) / seconds between light pulse
    power = ( ( 3600 / 1000 / pulsetime ) * 1000 ) * 100;
    update();
    lastpulse = Math.floor(Date.now());
    counter = 0;
}

setInterval(function() {
    if ( Math.floor(currentTime) % 3600 === 0 ) {
        //  500 pulses = 0.5kWh
        // 1200 pulses = 1.2kWh
        // energy = counterkWh / 1000;
        // we don't divide by 1000 here, as HA does that for us
        energy = counterkWh;
        counterkWh = 0;
    }
    currentTime = Math.floor(Date.now()) / 1000;
}, 1000 );

// Set up pin states
D1.write(0);
pinMode(D2, "input_pullup");

// Watch for pin changes
setWatch(function (e) {
    // Pulse red LED
    // digitalPulse(LED1,1,1);
    counter++;
    counterkWh++;
    if ( counter == "10" ) {
        calculateData();
    } else if ( counter > "10" ) {
        counter = 0;
    }
}, D2, { repeat: true, edge: "falling" });
