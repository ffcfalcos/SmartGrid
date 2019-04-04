import React from 'react';
import './App.css';

const request = require('request');

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
  GetEfficiency(){
    return this.efficiency;
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
let end = 0;
let flywheelsMaxStorage = 40; //kWh
let windSp = 0;
let windAz = 0;
let solarAlt = 0;
let solarAz = 0;

const SOLAR_PANEL_REQUEST = "http://localhost:8000/api/v1/producers/solar-panels";
const WIND_TURBINE_REQUEST = "http://localhost:8000/api/v1/producers/wind-turbines";
const BARRAGE_REQUEST = "http://localhost:8000/api/v1/producers/hydroelectric-dams";
const CITIES_REQUEST = "http://localhost:8000/api/v1/consumers/cities";
const FLYWHEELS_REQUEST = "http://localhost:8000/api/v1/storages/flywheels";
const TIME_REQUEST = "http://localhost:8000/api/v1/sensors/datetime";
const CENTRAL_REQUEST = "http://localhost:8000/api/v1/sensors/emissions";
const WIND_REQUEST = "http://localhost:8000/api/v1/sensors/wind";
const SOLAR_REQUEST = "http://localhost:8000/api/v1/sensors/sun";

console.log("Setted all constant");

function Initialization(){
  request(FLYWHEELS_REQUEST, function (error, response, body) {
    var data = JSON.parse(body);
    data.forEach(flywheel => {
      flywheels.push(new Flywheel(flywheel.id,flywheel.size,flywheel.efficiency,flywheel.storage,flywheel.consumption,flywheel.power,flywheel.mode));
    });
    request(CENTRAL_REQUEST, function (error, response, body) {
      var data = JSON.parse(body);
      central = new Central(data.emission,data.total);
    });
  });
}

function WriteData(fileName,content){
  let fileSystem = new ActiveXObject("Scripting.FileSystemObject");
  let file = fileSystem.OpenTextFile(fileName, 8 ,true);
  file.WriteLine(content);
  monFichier.Close();
}

function AnalyseWind(id,power,windAz,windSp){
  let minPower;
  let maxPower
  d3.csv("data/windTurbines.csv").then(function(data) {
    data.forEach(line => {
      if (line.id === id && (Math.abs((line.windA - windAz)/line.windA) <= 0,05 && (Math.abs((line.windS - windSp)/line.windS) <= 0,05){
        if (minPower === 0 || line.power < minPower){
          minPower = line.power;
        }
        if (maxPower === 0 || line.power > maxPower){
          maxPower = line.power;
        }
      }
    });
    if (power > minPower && power < maxPower){
      return true;
    }
    return false;
  }
}

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
  request(SOLAR_REQUEST, function (error, response, body) {
    let data = JSON.parse(body);
    solarAlt = data.altitude;
    solarAz = data.azimuth;
  };
  request(WIND_REQUEST, function (error, response, body) {
    let data = JSON.parse(body);
    windSp = data.speed;
    windAz = data.azimuth;
  };
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
            console.log("Previous time : " + time + " / New time : " + timeTest);
            console.log(sizeSolarPanels + "/" + solarPanels.length);
            while(1){
              console.log("Previous time : " + time + " / New time : " + timeTest);
              if(sizeSolarPanels !== 0 && sizeBarrages !== 0 && sizeCities !== 0 && sizeWindTurbines !== 0 && solarPanels.length === sizeSolarPanels && windTurbines.length === sizeWindTurbines && cities.length === sizeCities && barrages.length === sizeBarrages && time !== timeTest){
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
                        const maxStorage = (1 - flywheels[i].GetStorage()) * 40 * 3600 * flywheels[i].flywheelsMaxStorage; //whatt
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
                  central.UpdateTotal(ressource*central.GetEmission());
                  central.SetPower(ressource);
                }
                console.log("Solar Panel Power : "+sV);
                console.log("Barrage Power : "+bV);
                console.log("Wind Turbine Power : "+wV);
                console.log("Cities Power : "+cV);
                console.log("Central Power : "+uV);
                end = 1;
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
                let total_producer = sV+bV+wV+uV;
                
                if(result > 0){ //if Flywheels are consumer
                  //add flywheels power
                  document.getElementById("total_producer").textContent= total_producer;
                  console.log('Flywheels are consumer');
                  let idDiv = document.createElement("p");
                  idDiv.appendChild(document.createTextNode("Flywheels are consumer"));
                  idDiv.setAttribute('class','info');
                  let newDiv = document.createElement("div");
                  newDiv.setAttribute('class','block');
                  newDiv.appendChild(idDiv);
                  let currentDiv = document.getElementById("flywheelEnd1");
                  let parentDiv = document.getElementById("flywheelParent1");
                  parentDiv.insertBefore(newDiv, currentDiv);
                  flywheels.forEach(flywheel => {
                    let idDiv = document.createElement("p");
                    idDiv.appendChild(document.createTextNode("Flywheel Id : "+flywheel.GetId()));
                    let powerDiv = document.createElement("p");
                    powerDiv.appendChild(document.createTextNode("Consumption : "+flywheel.GetConsumption('k')+" kW"));
                    let storageDiv = document.createElement("p");
                    storageDiv.appendChild(document.createTextNode("Storage : "+flywheel.GetStorage()+ " %"));
                    let newDiv = document.createElement("div");
                    newDiv.setAttribute('class','block sub_block');
                    newDiv.appendChild(idDiv);
                    newDiv.appendChild(powerDiv);
                    newDiv.appendChild(storageDiv);
                    let currentDiv = document.getElementById("flywheelEnd2");
                    let parentDiv = document.getElementById("flywheelParent2");
                    parentDiv.insertBefore(newDiv, currentDiv);
                  });
                }
                else {
                  console.log('Flywheels are producer');
                  let idDiv = document.createElement("p");
                  idDiv.appendChild(document.createTextNode("Flywheels are producer"));
                  idDiv.setAttribute('class','info');
                  let newDiv = document.createElement("div");
                  newDiv.setAttribute('class','block');
                  newDiv.appendChild(idDiv);
                  let currentDiv = document.getElementById("flywheelEnd2");
                  let parentDiv = document.getElementById("flywheelParent2");
                  parentDiv.insertBefore(newDiv, currentDiv);
                  flywheels.forEach(flywheel => {
                    let idDiv = document.createElement("p");
                    idDiv.appendChild(document.createTextNode("Flywheel Id : "+flywheel.GetId()));
                    let powerDiv = document.createElement("p");
                    powerDiv.appendChild(document.createTextNode("Consumption : "+flywheel.GetConsumption('k')+" kW"));
                    let storageDiv = document.createElement("p");
                    storageDiv.appendChild(document.createTextNode("Storage : "+flywheel.GetStorage()+ " %"));
                    let newDiv = document.createElement("div");
                    newDiv.setAttribute('class','block sub_block');
                    newDiv.appendChild(idDiv);
                    newDiv.appendChild(powerDiv);
                    newDiv.appendChild(storageDiv);
                    let currentDiv = document.getElementById("flywheelEnd1");
                    let parentDiv = document.getElementById("flywheelParent1");
                    parentDiv.insertBefore(newDiv, currentDiv);
                  });
                }
                solarPanels.forEach(solarPanel => {
                  let idDiv = document.createElement("p");
                  idDiv.appendChild(document.createTextNode("Solar Panel Id : "+solarPanel.GetId()));                  
                  let powerDiv = document.createElement("p");
                  powerDiv.appendChild(document.createTextNode("Power : "+solarPanel.GetPower('k')+" kW"));
                  let rateDiv = document.createElement("p");
                  const rate = solarPanel.GetPower('k')/solarPanel.GetSize();
                  rateDiv.appendChild(document.createTextNode("Average : "+rate+" kW/m²"));
                  let newDiv = document.createElement("div");
                  newDiv.setAttribute('class','block sub_block');
                  newDiv.appendChild(idDiv);
                  newDiv.appendChild(powerDiv);
                  newDiv.appendChild(rateDiv);
                  let currentDiv = document.getElementById("solarEnd");
                  let parentDiv = document.getElementById("solarParent");
                  parentDiv.insertBefore(newDiv, currentDiv);
                });
                windTurbines.forEach(windTurbine => {
                  WriteData("windTurbines.csv",windTurbine.GetData(time,windAz,windSp)); 
                  let idDiv = document.createElement("p");
                  idDiv.appendChild(document.createTextNode("Wind Turbine Id : "+windTurbine.GetId()));
                  let powerDiv = document.createElement("p");
                  powerDiv.appendChild(document.createTextNode("Power : "+windTurbine.GetPower('k')+" kW"));
                  let rateDiv = document.createElement("p");
                  const rate = Math.round(windTurbine.GetPower('k')/windTurbine.GetNumber());
                  rateDiv.appendChild(document.createTextNode("Average : "+rate+" kW/U"));
                  let newDiv = document.createElement("div");
                  newDiv.setAttribute('class','block sub_block');
                  newDiv.appendChild(idDiv);
                  newDiv.appendChild(powerDiv);
                  newDiv.appendChild(rateDiv);
                  let currentDiv = document.getElementById("windEnd");
                  let parentDiv = document.getElementById("windParent");
                  parentDiv.insertBefore(newDiv, currentDiv);
                });
                barrages.forEach(barrages => {
                  let idDiv = document.createElement("p");
                  idDiv.appendChild(document.createTextNode("Barrage Id : "+barrages.GetId()));
                  let powerDiv = document.createElement("p");
                  powerDiv.appendChild(document.createTextNode("Power : "+barrages.GetPower('k')+" MW"));
                  let newDiv = document.createElement("div");
                  newDiv.setAttribute('class','block sub_block');
                  newDiv.appendChild(idDiv);
                  newDiv.appendChild(powerDiv);
                  let currentDiv = document.getElementById("barrageEnd");
                  let parentDiv = document.getElementById("barrageParent");
                  parentDiv.insertBefore(newDiv, currentDiv);
                });
                cities.forEach(city => {
                  let idDiv = document.createElement("p");
                  idDiv.appendChild(document.createTextNode("City Id : "+city.GetId()));
                  let powerDiv = document.createElement("p");
                  powerDiv.appendChild(document.createTextNode("Power : "+city.GetConsumption('k')+" MW"));
                  let newDiv = document.createElement("div");
                  newDiv.setAttribute('class','block sub_block');
                  newDiv.appendChild(idDiv);
                  newDiv.appendChild(powerDiv);
                  let currentDiv = document.getElementById("cityEnd");
                  let parentDiv = document.getElementById("cityParent");
                  parentDiv.insertBefore(newDiv, currentDiv);
                });
                let idDiv = document.createElement("p");
                idDiv.appendChild(document.createTextNode("Central Id : "+central.GetId()));
                let emissionDiv = document.createElement("p");
                emissionDiv.appendChild(document.createTextNode("Emission Rate : "+central.GetEmission()*1000+" kg/kW"));
                let powerDiv = document.createElement("p");
                powerDiv.appendChild(document.createTextNode("Power : "+central.GetPower()/1000+" kW"));
                let emissionIDiv = document.createElement("p");
                emissionIDiv.appendChild(document.createTextNode("Emission : "+central.GetPower()*central.GetEmission()+" kg"));
                let totalDiv = document.createElement("p");
                totalDiv.appendChild(document.createTextNode("Emission : "+central.GetTotal()+" kg"));
                let newDiv = document.createElement("div");
                newDiv.setAttribute('class','block sub_block');
                newDiv.appendChild(idDiv);
                newDiv.appendChild(emissionDiv);
                newDiv.appendChild(powerDiv);
                newDiv.appendChild(emissionIDiv);
                newDiv.appendChild(totalDiv);
                let currentDiv = document.getElementById("centralEnd");
                let parentDiv = document.getElementById("centralParent");
                parentDiv.insertBefore(newDiv, currentDiv);
                break;
              }
            }
          });
        });
      });
    });
  });
}
function App(){
    Initialization();
    setInterval(GettingData,1000);
    return (
      <div className={"header"}>
        <div>
          <div id="local" className="block local">
            <div><p>Date : <span id="date" className="date">03-04-2019</span></p></div>
            <div><p>Time : <span id="time" className="time">11:05:34</span></p></div>
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
              <p className={"block_title"}>Flywheels</p>
              <p>Power : <span id="fv">0</span> kW</p>
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
