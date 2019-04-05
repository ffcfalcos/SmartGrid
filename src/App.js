import React from 'react';
import './App.css';

const request = require('request');
const insertLine = require('insert-line')
const d3 = require('d3');

class Flywheel {
  constructor(id,size,efficiency,storage,consumption,power,mode){
    this.id = id;
    this.size = size;
    this.efficiency = efficiency;
    this.storage = storage;
    this.consumption = consumption;
    this.power = power;
    this.mode = mode;
  }
  UpdateStorage(storage){
    this.storage += storage
  }
  SetMode(mode){
    this.mode = mode;
  }
  SetPower(power){
    this.power = power;
  }
  SetStorage(storage){
    this.storage = storage;
  }
  GetStorage(){
    return this.storage;
  }
  GetId(){
    return this.id;
  }
  GetConsumption(){
    return this.consumption;
  }
  GetPower(){
    return this.power;
  }
  SetConsumption(consumption){
    this.consumption = consumption;
  }
  GetEfficiency() {
    return this.efficiency;
  }
}
  
class Central {
  constructor(emission,total){
    this.emission = emission;
    this.total = total;
    this.id = 1;
    this.power = 0;
  }
  GetTotal(){
    return this.total;
  }
  GetEmission(){
    return this.emission;
  }
  UpdateTotal(add){
    this.total += add;
  }
  GetId(){
    return this.id;
  }
  SetPower(power){
    this.power = power;
  }
  GetPower(){
    return this.power;
  }
}

let flywheels = [];
let solarData = [];
let windData = [];
let barrageData = [];
let flywheelData = [];
let cityData = [];
let centralData = [];
let central;
let sizeFlyWheels = 0;
let cV = 0;
let sV = 0;
let bV = 0;
let wV = 0;
let uV = 0;
let time = 0;
let flywheelsMaxStorage = 40; //kWh
let windSp = 0;
let windAz = 0;
let solarAlt = 0;
let solarAz = 0;
let first = 1;
let daySize = Math.round((6/7)*1680);
let weekLabel = [];
let dayLabel = [];

const SOLAR_PANEL_REQUEST = "http://localhost:8000/api/v1/producers/solar-panels";
const WIND_TURBINE_REQUEST = "http://localhost:8000/api/v1/producers/wind-turbines";
const BARRAGE_REQUEST = "http://localhost:8000/api/v1/producers/hydroelectric-dams";
const CITIES_REQUEST = "http://localhost:8000/api/v1/consumers/cities";
const FLYWHEELS_REQUEST = "http://localhost:8000/api/v1/storages/flywheels";
const TIME_REQUEST = "http://localhost:8000/api/v1/sensors/datetime";
const CENTRAL_REQUEST = "http://localhost:8000/api/v1/sensors/emissions";
const WIND_REQUEST = "http://localhost:8000/api/v1/sensors/wind";
const SOLAR_REQUEST = "http://localhost:8000/api/v1/sensors/sun";

console.log("Set all constant");

function Initialization(){
  request(FLYWHEELS_REQUEST, function (error, response, body) {
    let data = JSON.parse(body);
    sizeFlyWheels++;
    data.forEach(flywheel => {
      flywheels.push(new Flywheel(flywheel.id,flywheel.size,flywheel.efficiency,flywheel.storage,flywheel.consumption,flywheel.power,flywheel.mode));
    });
    request(CENTRAL_REQUEST, function (error, response, body) {
      let data = JSON.parse(body);
      central = new Central(data.emission,data.total);
    });
  });
  for(let i = 0 ; i < 1680 ; i++){
    solarData.push(0);
    windData.push(0);
    centralData.push(0);
    cityData.push(0);
    barrageData.push(0);
    const test = i/240;
    if(test.isInteger()){
      weekLabel.push("J-"+test);
    }
    else {
      weekLabel.push("");
    }
  }
  for(let i = 0 ; i < 240 ; i++){
    solarData.push(0);
    windData.push(0);
    centralData.push(0);
    cityData.push(0);
    barrageData.push(0);
    const test = i/10;
    if(test.isInteger()){
      dayLabel.push("H-"+test);
    }
    else {
      dayLabel.push("");
    }
  }
}

/*function WriteData(fileName,content){
  console.log("Writing in file : "+"data/"+fileName + " content : "+content);
  insertLine("data/"+fileName).append(content);
}*/

/*function AnalyseWind(id,power,windAz,windSp){
  let minPower;
  let maxPower;
  d3.csv("data/windTurbines.csv").then(function(data) {
    data.forEach(line => {
      if (line.id === id && (Math.abs((line.windA - windAz)/line.windA)) <= 0.05 && (Math.abs((line.windS - windSp)/line.windS) <= 0.05)){
        if (minPower === 0 || line.power < minPower){
          minPower = line.power;
        }
        if (maxPower === 0 || line.power > maxPower){
          maxPower = line.power;
        }
      }
    });
    return power > minPower && power < maxPower;

  });
}*/

function GettingData(){
  cV = 0;
  sV = 0;
  bV = 0;
  wV = 0;
  uV = 0;
  request(SOLAR_REQUEST, function (error, response, body) {
    let data = JSON.parse(body);
    solarAlt = Math.round((data.altitude*180)/6.28);
    solarAz = Math.round((data.azimuth*180)/6.28);
  });
  request(WIND_REQUEST, function (error, response, body) {
    let data = JSON.parse(body);
    windSp = Math.round(data.speed);
    windAz = Math.round((data.azimuth*180)/6.28);
  });
  request(TIME_REQUEST, function (error, response, body) {
    let data = JSON.parse(body);
    time = data.datetime;
  });
  request(SOLAR_PANEL_REQUEST, function (error, response, body) {
    let data = JSON.parse(body);
    data.forEach(solarPanel => {
      sV += solarPanel.power;
      let rate = Math.round(solarPanel.power / solarPanel.size);
      let power = Math.round(solarPanel.power/ 1000);
      if (first === 1) {
        let idDiv = document.createElement("p");
        idDiv.textContent = "Solar Panel Id : " + solarPanel.id;
        idDiv.setAttribute('id', 'solarI' + solarPanel.id);
        let powerDiv = document.createElement("p");
        powerDiv.textContent = "Power : " + power + " kW";
        powerDiv.setAttribute('id', 'solarP' + solarPanel.id);
        let rateDiv = document.createElement("p");
        rateDiv.setAttribute('id', 'solarR' + solarPanel.id);
        rateDiv.textContent = "Average : " + rate + " W/m²";
        let sizeDiv = document.createElement('p');
        sizeDiv.setAttribute('id', 'solarS' + solarPanel.id);
        sizeDiv.textContent = "Size : " + solarPanel.size + " m²";
        let azimuthDiv = document.createElement('p');
        azimuthDiv.setAttribute('id', 'solarA' + solarPanel.id);
        azimuthDiv.textContent = "Azimuth : " + Math.round((solarPanel.azimuth*180)/6.28) + " °";
        let newDiv = document.createElement("div");
        newDiv.setAttribute('class', 'block sub_block');
        newDiv.appendChild(idDiv);
        newDiv.appendChild(powerDiv);
        newDiv.appendChild(sizeDiv);
        newDiv.appendChild(rateDiv);
        newDiv.appendChild(azimuthDiv);
        let currentDiv = document.getElementById("solarEnd");
        let parentDiv = document.getElementById("solarParent");
        parentDiv.insertBefore(newDiv, currentDiv);
      }
      else {
        document.getElementById('solarP' + solarPanel.id).textContent = "Power : " + power + " kW";
        document.getElementById('solarR' + solarPanel.id).textContent = "Average : " + rate + " W/m²";
      }
    });
    request(WIND_TURBINE_REQUEST, function (error, response, body) {
      let data = JSON.parse(body);
      data.forEach(windTurbine => {
        wV += windTurbine.power;
        if (first === 1) {
          let idDiv = document.createElement("p");
          idDiv.appendChild(document.createTextNode("Wind Turbine Id : " + windTurbine.id));
          idDiv.setAttribute('id', 'windI' + windTurbine.id);
          let powerDiv = document.createElement("p");
          powerDiv.appendChild(document.createTextNode("Power : " + (windTurbine.power)/1000 + " kW"));
          powerDiv.setAttribute('id', 'windP' + windTurbine.id);
          let rateDiv = document.createElement("p");
          const rate = Math.round(((windTurbine.power)/1000) / windTurbine.number);
          rateDiv.appendChild(document.createTextNode("Average : " + rate + " kW/U"));
          rateDiv.setAttribute('id', 'windR' + windTurbine.id);
          let azimuthDiv = document.createElement('p');
          azimuthDiv.setAttribute('id', 'windA' + windTurbine.id);
          azimuthDiv.textContent = "Azimuth : " + Math.round((windTurbine.azimuth*180)/6.28) + " °";
          let numberDiv = document.createElement('p');
          numberDiv.setAttribute('id', 'windN' + windTurbine.id);
          numberDiv.textContent = "Number : " + windTurbine.number;
          let newDiv = document.createElement("div");
          newDiv.setAttribute('class', 'block sub_block');
          newDiv.appendChild(idDiv);
          newDiv.appendChild(powerDiv);
          newDiv.appendChild(numberDiv);
          newDiv.appendChild(rateDiv);
          newDiv.appendChild(azimuthDiv);
          let currentDiv = document.getElementById("windEnd");
          let parentDiv = document.getElementById("windParent");
          parentDiv.insertBefore(newDiv, currentDiv);
        }
        else {
          const rate = Math.round(((windTurbine.power)/1000) / windTurbine.number);
          document.getElementById("windP" + windTurbine.id).textContent = "Power : " + Math.round((windTurbine.power)/1000) + " kW";
          document.getElementById("windR" + windTurbine.id).textContent = "Average : " + rate + " kW/U";
        }
      });
      request(BARRAGE_REQUEST, function (error, response, body) {
        let data = JSON.parse(body);
        data.forEach(barrage => {
          bV += barrage.power;
          if(first === 1) {
            let idDiv = document.createElement("p");
            idDiv.appendChild(document.createTextNode("Barrage Id : " + barrage.id));
            let powerDiv = document.createElement("p");
            powerDiv.appendChild(document.createTextNode("Power : " + barrage.power/1000000 + " MW"));
            powerDiv.setAttribute('id','barrageP'+barrage.id);
            let newDiv = document.createElement("div");
            newDiv.setAttribute('class', 'block sub_block');
            newDiv.appendChild(idDiv);
            newDiv.appendChild(powerDiv);
            let currentDiv = document.getElementById("barrageEnd");
            let parentDiv = document.getElementById("barrageParent");
            parentDiv.insertBefore(newDiv, currentDiv);
          }
          else {
            document.getElementById('barrageP'+barrage.id).textContent = "Power : " + barrage.power/1000 + " kW";
          }
        });
        request(CITIES_REQUEST, function (error, response, body) {
          let data = JSON.parse(body);
          data.forEach(city => {
            cV += city.consumption;
            if (first === 1) {
              let idDiv = document.createElement("p");
              idDiv.appendChild(document.createTextNode("City Id : " + city.id));
              idDiv.setAttribute('id', 'cityI' + city.id);
              let powerDiv = document.createElement("p");
              powerDiv.appendChild(document.createTextNode("Power : " + city.consumption/1000 + " kW"));
              powerDiv.setAttribute('id', 'cityP' + city.id);
              let newDiv = document.createElement("div");
              newDiv.setAttribute('class', 'block sub_block');
              newDiv.appendChild(idDiv);
              newDiv.appendChild(powerDiv);
              let currentDiv = document.getElementById("cityEnd");
              let parentDiv = document.getElementById("cityParent");
              parentDiv.insertBefore(newDiv, currentDiv);
            } else {
              document.getElementById("cityP" + city.id).textContent = "Power : " + city.consumption/1000 + " kW";
            }
          });
          //Got all data, calculating
          const generation = sV + wV + bV; //Watt
          const consumption = cV; //Watt
          const result = generation - consumption; //Watt
          if (result > 0) { //if we get extra power
            let overflow = result; //Watt
            console.log("Saving power --> Charging flywheels");
            flywheels.forEach( flywheel => {
              let overflowP = (((overflow / 360) / 1000) / flywheelsMaxStorage) * flywheel.GetEfficiency(); //The percentage of the overflow
              const storage = flywheel.GetStorage(); //%
              console.log("Storage : "+storage);
              if (storage < 1 && overflow > 0) { //if the flywheel storage is not full
                console.log('--> First Flywheel is not full');
                if ((storage + overflowP) < 1) { //if the flywheel can store all the overflow
                  console.log('--> This Flywheel can save all : ' + overflowP);
                  flywheel.UpdateStorage(overflowP*0.98); //Watt --> Watt/h --> kWatt/h
                  flywheel.SetConsumption(overflow);
                  flywheel.SetMode("Consumer");
                  overflow = 0;
                } else { //if the flywheel can't store all the overflow
                  const maxStorage = (1 - flywheel.GetStorage()) * 40 * 360 * flywheelsMaxStorage; //Watt
                  flywheel.SetStorage(1);
                  flywheel.SetConsumption(overflow);
                  flywheel.SetMode("Idle");
                  overflow -= maxStorage;
                }
              }
            });
          }
          else { //not enough power from producer
            let resource = Math.abs(result); //power needed in Watt
            console.log("Missing " + resource / 1000 + "kW");
            flywheels.forEach( flywheel => {
              let maxPower = flywheel.GetStorage() * flywheelsMaxStorage * 360 * 1000; //power of the flywheel in Watt
              if (maxPower > 40000) {
                maxPower = 40000; //Setting max power in Watt
              }
              flywheel.SetPower(maxPower);
              if (resource > 0) {
                if (resource <= maxPower) { //if this flywheel has enough for power
                  flywheel.UpdateStorage(0 - ((maxPower / 360) / 1000) / 40);
                  flywheel.SetMode("Producer");
                  resource = 0;
                } else {
                  resource -= maxPower;
                  flywheel.UpdateStorage(0 - ((maxPower / 360) / 1000) / 40);
                  flywheel.SetMode("Producer");
                }
              }
            });
            central.UpdateTotal(resource * central.GetEmission());
            central.SetPower(resource);
            uV = resource;
            if(resource > 0) {
              console.log("--> Getting resource from coal : " + resource);
            }
          }
          const total_producer = Math.round((generation + uV)/1000);
          sV = Math.round(sV / 1000);
          wV = Math.round(wV / 1000);
          bV = Math.round(bV / 1000);
          cV = Math.round(cV / 1000);
          uV = Math.round(uV / 1000);
          solarData.push(sV);
          windData.push(wV);
          barrageData.push(bV);
          cityData.push(cV);
          centralData.push(uV);
          solarData.shift();
          windData.shift();
          barrageData.shift();
          cityData.shift();
          centralData.shift();
          document.getElementById("speed").textContent = windSp + " m/s";
          document.getElementById("altitude").textContent = solarAlt + " °";
          document.getElementById("azimuthW").textContent = windAz + " °";
          document.getElementById("azimuthS").textContent = solarAz + " °";
          document.getElementById("sv").textContent = sV;
          document.getElementById("bv").textContent = bV;
          document.getElementById("wv").textContent = wV;
          document.getElementById("cv").textContent = cV;
          document.getElementById("uv").textContent = uV;
          document.getElementById("date").textContent = time;
          document.getElementById('total_producer1').textContent = total_producer + " kW";
          document.getElementById('total_producer2').textContent = total_producer + " kW";
          console.log("First : " + first);
          flywheels.forEach(flywheel => {
            if (first === 1) {
              let idDiv = document.createElement("p");
              idDiv.appendChild(document.createTextNode("Flywheel Id : " + flywheel.GetId()));
              let powerDiv = document.createElement("p");
              powerDiv.appendChild(document.createTextNode("Consumption : " + Math.round(flywheel.GetConsumption()/1000) + " kW"));
              powerDiv.setAttribute('id', 'flyP2' + flywheel.GetId())
              let storageDiv = document.createElement("p");
              storageDiv.appendChild(document.createTextNode("Storage : " + flywheel.GetStorage() + " %"));
              storageDiv.setAttribute('id', 'flyS2' + flywheel.GetId())
              let newDiv = document.createElement("div");
              newDiv.setAttribute('class', 'block sub_block');
              newDiv.appendChild(idDiv);
              newDiv.appendChild(powerDiv);
              newDiv.appendChild(storageDiv);
              let currentDiv = document.getElementById("flywheelEnd2");
              let parentDiv = document.getElementById("flywheelParent2");
              parentDiv.insertBefore(newDiv, currentDiv);
            } else {
              document.getElementById('flyP2' + flywheel.GetId()).textContent = "Consumption : " + Math.round(flywheel.GetConsumption()/1000) + " kW";
              document.getElementById('flyS2' + flywheel.GetId()).textContent = "Storage : " + flywheel.GetStorage() + " %";
            }
          });
          flywheels.forEach(flywheel => {
            if (first === 1) {
              let idDiv = document.createElement("p");
              idDiv.appendChild(document.createTextNode("Flywheel Id : " + flywheel.GetId()));
              let powerDiv = document.createElement("p");
              powerDiv.appendChild(document.createTextNode("Power : " + flywheel.GetPower('k') + " kW"));
              powerDiv.setAttribute('id', 'flyP1' + flywheel.GetId())
              let storageDiv = document.createElement("p");
              storageDiv.appendChild(document.createTextNode("Storage : " + flywheel.GetStorage() + " %"));
              storageDiv.setAttribute('id', 'flyS1' + flywheel.GetId())
              let newDiv = document.createElement("div");
              newDiv.setAttribute('class', 'block sub_block');
              newDiv.appendChild(idDiv);
              newDiv.appendChild(powerDiv);
              newDiv.appendChild(storageDiv);
              let currentDiv = document.getElementById("flywheelEnd1");
              let parentDiv = document.getElementById("flywheelParent1");
              parentDiv.insertBefore(newDiv, currentDiv);
            } else {
              document.getElementById('flyP1' + flywheel.GetId()).textContent = "Power : " + flywheel.GetPower()/1000 + " kW";
              document.getElementById('flyS1' + flywheel.GetId()).textContent = "Storage : " + flywheel.GetStorage() + " %";
            }
          });
          if (result > 0) { //if Flywheels are consumer
            //add flywheels power
            // we display consumer parent and hide the other one
            document.getElementById("flywheelParent2").style.display = "";
            document.getElementById("flywheelParent1").style.display = "none";
          }
          else {
            console.log('Flywheels are producer');
            document.getElementById("flywheelParent1").style.display = "";
            document.getElementById("flywheelParent2").style.display = "none";
          }
          //Graphs creation below
          
          var solarDay = new Chart(document.getElementById('solar_day).getContext('2d'), {
            type: 'line',
            data: {
              labels: dayArray,
              datasets: [{
                label: 'kW',
                data: solarData.slice(daySize),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
              }]
            }
          }); 
          first = 0;
        });
      });
    });
  });
}
function App(){
    Initialization();
    setInterval(GettingData,1000);
    return (
      <div className={"overall"}>
        <div className={"header"}>
          <div id="local" className="block local">
            <div><p>Date/Time : <span id="date" className="date">-</span></p></div>
          </div>
          <div id="wind" className="block wrap_wind">
            <div><p>Wind Speed : <span id="speed">-</span></p></div>
            <div><p>Wind Azimuth : <span id="azimuthW">-</span></p></div>
          </div>
          <div id="solar" className="block wrap_solar">
            <div><p>Altitude : <span id="altitude">-</span></p></div>
            <div><p>Azimuth : <span id="azimuthS">-</span></p></div>
          </div>
          <div id="co2" className="block wrapco2">
            <div><p>Production : <span id="co2prod">100 kg/h</span></p></div>
            <div><p>Total Production : <span id="co2total">48744 kg</span></p></div>
          </div>
          <div>
            <p className={"block"}>Producers <span id="total_producer1">0</span></p>
          </div>
        </div>
        <div id={"Producer"} className={"Producer"}>
          <p className={"title"}>Producers <span id="total_producer2">0</span></p>
          <div className={"line"} id={"solarParent"}>
            <div id={"solar"} className={"block main_block"}>
              <p className={"block_title"}>Solar Panels</p>
              <p>Power : <span id="sv">0</span> kW</p>
            </div>
            <div id={"solarEnd"}/>
          </div>
          <div className={"line"} id={"windParent"}>
            <div id={"wind"} className={"block main_block"}>
              <p className={"block_title"}>Wind Turbines</p>
              <p>Power : <span id="wv">-</span> kW</p>
            </div>
            <div id={"windEnd"}/>
          </div>
          <div className={"line"} id={"barrageParent"}>
            <div id={"barrage"} className={"block main_block"}>
              <p className={"block_title"}>Barrages</p>
              <p>Power : <span id="bv">-</span> kW</p>
            </div>
            <div id={"barrageEnd"}/>
          </div>
          <div className={"line flywheelParent"} id={"flywheelParent1"}>
            <div id={"flywheel"} className={"block main_block"}>
              <p className={"block_title"}>Flywheels</p>
              <p>Power : <span id="fv">0</span> kW</p>
            </div>
            <div id={"flywheelEnd1"}/>
          </div>
          <div className={"line centralParent"} id={"centralParent"}>
            <div id={"central"} className={"block main_block"}>
              <p className={"block_title"}>Coal Central</p>
              <p>Power : <span id="uv">0</span> kW</p>
            </div>
            <div id={"centralEnd"}/>
          </div>
        </div>
        <div id={"Consumer"} className={"Consumer"}>
          <p className={"title"}>Consumers</p>
          <div className={"line"} id={"cityParent"}>
            <div id={"city"} className={"block main_block"}>
              <p className={"block_title"}>Cities</p>
              <p>Power : <span id="cv">0</span> kW</p>
            </div>
            <div id={"cityEnd"}/>
          </div>
          <div className={"line flywheelParent"} id={"flywheelParent2"}>
            <div id={"flywheel"} className={"block main_block"}>
              <p className={"block_title"}>Flywheels</p>
              <p>Power : <span id="fv">0</span> kW</p>
            </div>
            <div id={"flywheelEnd2"}/>
          </div>
        </div>
        <div id={"Stats"}>
        <p>Stats</p>
        <div id={"stats_solar"}>
          <div id={"wrap_solar_day"} className={"block graph"}>
            <canvas id={"solar_day"}></canvas>
          </div>
          <div id={"wrap_solar_week"} className={"block graph"}>
            <canvas id={"solar_week"}></canvas>
          </div>
        </div>
        <div id={"stats_wind"}>
          <div id={"wrap_wind_day"} className={"block graph"}>
            <canvas id={"wind_day"}></canvas>
          </div>
          <div id={"wrap_wind_week"} className={"block graph"}>
            <canvas id={"wind_week"}></canvas>
          </div>
        </div>
        <div id={"stats_barrage"}>
          <div id={"wrap_barrage_day"} className={"block graph"}>
            <canvas id={"barrage_day"}></canvas>
          </div>
          <div id={"wrap_barrage_week"} className={"block graph"}>
            <canvas id={"barrage_week"}></canvas>
          </div>
        </div>
        <div id={"stats_central"}>
          <div id={"wrap_central_day"} className={"block graph"}>
            <canvas id={"central_day"}></canvas>
          </div>
          <div id={"wrap_central_week"} className={"block graph"}>
            <canvas id={"central_week"}></canvas>
          </div>
        </div>
      </div>
    );
}

export default App;
