import React from 'react';
import './App.css';

const request = require('request');
const insertLine = require('insert-line')
const d3 = require('d3');

class SolarPanel {
  constructor(id,power,size,azimuth,tilt){
    this.id = id;
    this.power = power;
    this.size = size;
    this.azimuth = azimuth;
    this.tilt = tilt;
  }
  GetId(){
    return this.id
  }
  GetPower(char){
    if (char === 'k'){
      return Math.round(this.power/1000);
    }
    return this.power;
  }
  GetSize(){
    return this.size;
  }
  GetAzimuth(){
    return this.azimuth;
  }
  GetTilt(){
    return this.tilt;
  }
}

class WindTurbine {
  constructor(id,power,number,azimuth){
    this.id = id;
    this.power = power;
    this.number = number;
    this.azimuth = azimuth;
  }
  GetId(){
    return this.id;
  }
  GetPower(char){
    if (char === 'k'){
      return Math.round(this.power/1000);
    }
    return this.power;
  }
  GetNumber(){
    return this.number;
  }
  GetAzimuth(){
    return this.azimuth;
  }
  GetData(time,windAz,windSp){ // id,power,number,azimuth,windS,windA
    return time + ',' + this.id + ',' + this.power + ',' + this.number + ',' + this.azimuth + ',' + windSp + ',' + windAz;
  }
}

class Barrage {
  constructor(id,power){
    this.id = id;
    this.power = power;
  }
  GetId(){
    return this.id;
  }
  GetPower(char){
    if (char === 'k'){
      return Math.round(this.power/1000000);
    }
    return this.power;
  }
}

class City {
  constructor(id,population,consumption){
    this.id = id;
    this.population = population;
    this.consumption = consumption;
  }
  GetId(){
    return this.id;
  }
  GetPopulation(){
    return this.population;
  }
  GetConsumption(char){
    if (char === 'k'){
      return Math.round(this.consumption/1000000);
    }
    return this.consumption;
  }
}

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

let solarPanels = [];
let windTurbines = [];
let flywheels = [];
let cities = [];
let barrages = [];
let central;
let sizeSolarPanels = 0;
let sizeWindTurbines = 0;
let sizeCities = 0;
let sizeBarrages = 0;
let sizeFlyWheels = 0;
let cV = 0;
let sV = 0;
let bV = 0;
let wV = 0;
let uV = 0;
let time = 0;
let timeTest = 0;
let flywheelsMaxStorage = 40; //kWh
let windSp = 0;
let windAz = 0;
let solarAlt = 0;
let solarAz = 0;
let first = 1;

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
    data.forEach(flywheel => {
      flywheels.push(new Flywheel(flywheel.id,flywheel.size,flywheel.efficiency,flywheel.storage,flywheel.consumption,flywheel.power,flywheel.mode));
    });
    request(CENTRAL_REQUEST, function (error, response, body) {
      let data = JSON.parse(body);
      central = new Central(data.emission,data.total);
    });
  });
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

let promise1 = new Promise(function(resolve, reject){
  request(SOLAR_REQUEST, function (error, response, body) {
    let data = JSON.parse(body);
    solarAlt = data.altitude;
    solarAz = data.azimuth;
  });
});

function GettingData(){
  sizeSolarPanels = 0;
  sizeWindTurbines = 0;
  sizeCities = 0;
  sizeBarrages = 0;
  cV = 0;
  sV = 0;
  bV = 0;
  wV = 0;
  uV = 0;
  solarPanels = [];
  windTurbines = [];
  barrages = [];
  cities = [];

  request(WIND_REQUEST, function (error, response, body) {
    let data = JSON.parse(body);
    windSp = data.speed;
    windAz = data.azimuth;
  });
  request(TIME_REQUEST, function (error, response, body) {
    let data = JSON.parse(body);
    console.log(body);
    timeTest = data.datetime;
    request(WIND_TURBINE_REQUEST, function (error, response, body) {
      let data = JSON.parse(body);
      sizeWindTurbines = data.length;
      data.forEach(windTurbine => {
        wV += windTurbine.power;
        windTurbines.push(new WindTurbine(windTurbine.id,windTurbine.power,windTurbine.number,windTurbine.azimuth));
      });
      request(BARRAGE_REQUEST, function (error, response, body) {
        let data = JSON.parse(body);
        sizeBarrages = data.length;
        data.forEach(barrage => {
          bV += barrage.power;
          barrages.push(new Barrage(barrage.id,barrage.power));
        });
        request(CITIES_REQUEST, function (error, response, body) {
          let data = JSON.parse(body);
          sizeCities = data.length;
          data.forEach(city => {
            cV += city.consumption;
            cities.push(new City(city.id,city.population,city.consumption));
          });
          request(SOLAR_PANEL_REQUEST, function (error, response, body) {
            let data = JSON.parse(body);
            sizeSolarPanels = data.length;
            data.forEach(solarPanel => {
              sV += solarPanel.power;
              solarPanels.push(new SolarPanel(solarPanel.id, solarPanel.power, solarPanel.number, solarPanel.azimuth, solarPanel.tilt));
            });
            time = timeTest;
            if(cV > bV + sV + wV) {
              console.log("Loosing power");
            }
            else {
              console.log("Saving power");
            }
            const generation = sV + wV + bV; //Whatt
            const consumption = cV; //Whatt
            const result = generation - consumption; //Whatt
            if (result > 0){ //if we get extra power
              let overflow = result; //Whatt
              console.log("Saving power --> Charging flywheels");
              let i;
              for(i = 0; i < sizeFlyWheels; i++){
                flywheels[i].SetPower(0);
                let overflowP = (((overflow/3600)/1000)/flywheelsMaxStorage)*flywheels[i].GetEfficiency(); //The percentage of the overflow
                const storage = flywheels[i].GetStorage(); //%
                if(storage < 1){ //if the flywheel storage is not full
                  if((storage + overflowP) < 1){ //if the flywheel can storage all the overflow
                    flywheels[i].UpdateStorage(overflowP); //Whatt --> Whatt/h --> kWhatt/h
                    flywheels[i].SetConsumption(overflow);
                    flywheels[i].SetMode("Consumer");
                    break;
                  }
                  else { //if the flywheel can't store all the overflow
                    const maxStorage = (1 - flywheels[i].GetStorage()) * 40 * 3600 * flywheelsMaxStorage; //whatt
                    flywheels[i].SetStorage(1);
                    flywheels[i].SetConsumption(overflow);
                    flywheels[i].SetMode("Idle");
                    overflow -= maxStorage/flywheels[i].GetEfficiency();
                    break;
                  }
                }
              }
            }
            else { //not enough power from producer
              let resource = Math.abs(result); //power needed in Whatt
              console.log("Missing " + resource/1000 + "kW");
              for (let i = 0; i < sizeFlyWheels; i++) {
                let maxPower = flywheels[i].GetStorage()*flywheelsMaxStorage*3600*1000; //power of the flywheel in Whatt
                if (maxPower > 40000) {
                  maxPower = 40000; //Setting max power in Whatt
                }
                flywheels[i].SetPower = maxPower;
                if (resource <= maxPower) { //if this flywheel has enough for power
                  flywheels[i].UpdateStorage(0 - ((maxPower/3600)/1000)/40);
                  flywheels[i].SetMode("Producer");
                  break;
                }
                else {
                  resource -= maxPower;
                  flywheels[i].UpdateStorage(0 - ((maxPower/3600)/1000)/40);
                  flywheels[i].SetMode("Producer");
                }
              }
              central.UpdateTotal(resource*central.GetEmission());
              central.SetPower(resource);
            }
            console.log("Solar Panel Power : "+sV);
            console.log("Barrage Power : "+bV);
            console.log("Wind Turbine Power : "+wV);
            console.log("Cities Power : "+cV);
            console.log("Central Power : "+uV);
            sV = Math.round(sV/1000);
            wV = Math.round(wV/1000);
            bV = Math.round(bV/1000);
            cV = Math.round(cV/1000);
            uV = Math.round(uV/1000);
            document.getElementById("sv").textContent=sV;
            document.getElementById("bv").textContent=bV;
            document.getElementById("wv").textContent=wV;
            document.getElementById("cv").textContent=cV;
            document.getElementById("uv").textContent=uV;
            document.getElementById("date").textContent=time;
            let total_producer = sV+bV+wV+uV;
            console.log("First : "+first);
            flywheels.forEach(flywheel => {
              if(first === 1) {
                let idDiv = document.createElement("p");
                idDiv.appendChild(document.createTextNode("Flywheel Id : " + flywheel.GetId()));
                let powerDiv = document.createElement("p");
                powerDiv.appendChild(document.createTextNode("Power : " + flywheel.GetPower('k') + " kW"));
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
              }
              else {
                document.getElementById('flyP2' + flywheel.GetId()).textContent = "Power : " + flywheel.GetPower('k') + " kW";
                document.getElementById('flyS2' + flywheel.GetId()).textContent = "Storage : " + flywheel.GetStorage() + " %";
              }
            });
            flywheels.forEach(flywheel => {
              if(first === 1) {
                let idDiv = document.createElement("p");
                idDiv.appendChild(document.createTextNode("Flywheel Id : " + flywheel.GetId()));
                let powerDiv = document.createElement("p");
                powerDiv.appendChild(document.createTextNode("Consumption : " + flywheel.GetConsumption('k') + " kW"));
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
              }
              else {
                document.getElementById('flyP1' + flywheel.GetId()).textContent = "Consumption : " + flywheel.GetConsumption('k') + " kW";
                document.getElementById('flyS1' + flywheel.GetId()).textContent = "Storage : " + flywheel.GetStorage() + " %";
              }
            });
            if(result > 0) { //if Flywheels are consumer
              //add flywheels power
              // we display consumer parent and hide the other one
              document.getElementById("flywheelParent1").style.display = "";
              document.getElementById("flywheelParent2").style.display = "none";
            }
            else {
              console.log('Flywheels are producer');
              document.getElementById("flywheelParent2").style.display = "";
              document.getElementById("flywheelParent1").style.display = "none";
            }
            solarPanels.forEach(solarPanel => {
              if(first === 1) {
                let idDiv = document.createElement("p");
                idDiv.appendChild(document.createTextNode("Solar Panel Id : " + solarPanel.GetId()));
                idDiv.setAttribute('id', 'solarI'+solarPanel.GetId());
                let powerDiv = document.createElement("p");
                powerDiv.appendChild(document.createTextNode("Power : " + solarPanel.GetPower('k') + " kW"));
                powerDiv.setAttribute('id', 'solarP'+solarPanel.GetId());
                let rateDiv = document.createElement("p");
                rateDiv.setAttribute('id', 'solarR'+solarPanel.GetId());
                const rate = solarPanel.GetPower('k') / solarPanel.GetSize();
                rateDiv.appendChild(document.createTextNode("Average : " + rate + " kW/m²"));
                let newDiv = document.createElement("div");
                newDiv.setAttribute('class', 'block sub_block');
                newDiv.appendChild(idDiv);
                newDiv.appendChild(powerDiv);
                newDiv.appendChild(rateDiv);
                let currentDiv = document.getElementById("solarEnd");
                let parentDiv = document.getElementById("solarParent");
                parentDiv.insertBefore(newDiv, currentDiv);
              }
              else {
                const rate = solarPanel.GetPower('k') / solarPanel.GetSize();
                document.getElementById("solarP"+solarPanel.GetId()).textContent="Power : " + solarPanel.GetPower('k') + " kW";
                document.getElementById("solarR"+solarPanel.GetId()).textContent="Average : " + rate + " kW/m²";
              }
            });
            windTurbines.forEach(windTurbine => {
              //WriteData("windTurbines.csv",windTurbine.GetData(time,windAz,windSp));
              if(first === 1) {
                let idDiv = document.createElement("p");
                idDiv.appendChild(document.createTextNode("Wind Turbine Id : " + windTurbine.GetId()));
                idDiv.setAttribute('id', 'windI'+ windTurbine.GetId());
                let powerDiv = document.createElement("p");
                powerDiv.appendChild(document.createTextNode("Power : " + windTurbine.GetPower('k') + " kW"));
                powerDiv.setAttribute('id', 'windP'+ windTurbine.GetId());
                let rateDiv = document.createElement("p");
                const rate = Math.round(windTurbine.GetPower('k') / windTurbine.GetNumber());
                rateDiv.appendChild(document.createTextNode("Average : " + rate + " kW/U"));
                rateDiv.setAttribute('id', 'windR'+ windTurbine.GetId());
                let newDiv = document.createElement("div");
                newDiv.setAttribute('class', 'block sub_block');
                newDiv.appendChild(idDiv);
                newDiv.appendChild(powerDiv);
                newDiv.appendChild(rateDiv);
                let currentDiv = document.getElementById("windEnd");
                let parentDiv = document.getElementById("windParent");
                parentDiv.insertBefore(newDiv, currentDiv);
              }
              else {
                const rate = Math.round(windTurbine.GetPower('k') / windTurbine.GetNumber());
                document.getElementById("solarP"+ windTurbine.GetId()).textContent="Power : " + windTurbine.GetPower('k') + " kW";
                document.getElementById("solarR"+ windTurbine.GetId()).textContent="Average : " + rate + " kW/U";
              }
            });
            barrages.forEach(barrages => {
              if(first === 1) {
                let idDiv = document.createElement("p");
                idDiv.appendChild(document.createTextNode("Barrage Id : " + barrages.GetId()));
                let powerDiv = document.createElement("p");
                powerDiv.appendChild(document.createTextNode("Power : " + barrages.GetPower('k') + " MW"));
                powerDiv.setAttribute('id','barrageP'+barrages.GetId())
                let newDiv = document.createElement("div");
                newDiv.setAttribute('class', 'block sub_block');
                newDiv.appendChild(idDiv);
                newDiv.appendChild(powerDiv);
                let currentDiv = document.getElementById("barrageEnd");
                let parentDiv = document.getElementById("barrageParent");
                parentDiv.insertBefore(newDiv, currentDiv);
              }
              else {
                document.getElementById('barrageP'+barrages.GetId()).textContent = "Power : " + barrages.GetPower('k') + " MW";
              }
            });
            cities.forEach(city => {
              if(first === 1) {
                let idDiv = document.createElement("p");
                idDiv.appendChild(document.createTextNode("City Id : " + city.GetId()));
                idDiv.setAttribute('id','cityI'+ city.GetId());
                let powerDiv = document.createElement("p");
                powerDiv.appendChild(document.createTextNode("Power : " + city.GetConsumption('k') + " MW"));
                powerDiv.setAttribute('id','cityP'+ city.GetId());
                let newDiv = document.createElement("div");
                newDiv.setAttribute('class', 'block sub_block');
                newDiv.appendChild(idDiv);
                newDiv.appendChild(powerDiv);
                let currentDiv = document.getElementById("cityEnd");
                let parentDiv = document.getElementById("cityParent");
                parentDiv.insertBefore(newDiv, currentDiv);
              }
              else {
                document.getElementById("cityP"+city.GetId()).textContent = "Power : " + city.GetConsumption('k') + " MW";
              }
            });
            if(first === 1) {
              let idDiv = document.createElement("p");
              idDiv.appendChild(document.createTextNode("Central Id : " + central.GetId()));
              let emissionDiv = document.createElement("p");
              emissionDiv.appendChild(document.createTextNode("Emission Rate : " + central.GetEmission() * 1000 + " kg/kW"));
              let powerDiv = document.createElement("p");
              powerDiv.appendChild(document.createTextNode("Power : " + central.GetPower() / 1000 + " kW"));
              let emissionIDiv = document.createElement("p");
              emissionIDiv.appendChild(document.createTextNode("Emission : " + central.GetPower() * central.GetEmission() + " kg"));
              let totalDiv = document.createElement("p");
              totalDiv.appendChild(document.createTextNode("Emission : " + central.GetTotal() + " kg"));
              let newDiv = document.createElement("div");
              newDiv.setAttribute('class', 'block sub_block2');
              newDiv.appendChild(idDiv);
              newDiv.appendChild(emissionDiv);
              newDiv.appendChild(powerDiv);
              newDiv.appendChild(emissionIDiv);
              newDiv.appendChild(totalDiv);
              let currentDiv = document.getElementById("centralEnd");
              let parentDiv = document.getElementById("centralParent");
              parentDiv.insertBefore(newDiv, currentDiv);
            }
            first = 0;
          });
        });
      });
    });
  });
}
function App(){
    Initialization();
    setInterval(GettingData,5000);
    return (
      <div className={"overall"}>
        <div className={"header"}>
          <div id="local" className="block local">
            <div><p>Date/Time : <span id="date" className="date">03-04-2019</span></p></div>
          </div>
          <div id="wind" className="block wrap_wind">
            <div><p>Wind Speed : <span id="speed">50 km/h</span></p></div>
            <div><p>Wind Azimuth : <span id="azimutW">30°</span></p></div>
          </div>
          <div id="solar" className="block wrap_solar">
            <div><p>Luminosity : <span id="luminosity">100 Lumens</span></p></div>
            <div><p>Azimuth : <span id="azimuthS">45°</span></p></div>
          </div>
          <div id="co2" className="block wrapco2">
            <div><p>Production : <span id="co2prod">100 kg/h</span></p></div>
            <div><p>Total Production : <span id="co2total">48744 kg</span></p></div>
          </div>
          <div>
            <p className={"title block"}>Producers <span id="total_producer">0</span> kW</p>
          </div>
        </div>
        <div id={"Producer"} className={"Producer"}>
          <p className={"title"}>Producers <span id="total_producer">0</span> kW</p>
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
              <p>Power : <span id="wv">0</span> kW</p>
            </div>
            <div id={"windEnd"}/>
          </div>
          <div className={"line"} id={"barrageParent"}>
            <div id={"barrage"} className={"block main_block"}>
              <p className={"block_title"}>Barrages</p>
              <p>Power : <span id="bv">0</span> kW</p>
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
        </div>
      </div>
    );
}

export default App;
