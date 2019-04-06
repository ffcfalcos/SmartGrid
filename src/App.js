import React from 'react';
import './App.css';

const request = require('request');

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
  GetMode(){
    return this.mode;
  }
  GetSize(){
    return this.size;
  }
}

let flywheels = [];
let central = {'id': 1, 'emission': 0, 'power': 0, 'total': 0};

const SOLAR_PANEL_REQUEST = "http://localhost:8000/api/v1/producers/solar-panels";
const WIND_TURBINE_REQUEST = "http://localhost:8000/api/v1/producers/wind-turbines";
const BARRAGE_REQUEST = "http://localhost:8000/api/v1/producers/hydroelectric-dams";
const CITIES_REQUEST = "http://localhost:8000/api/v1/consumers/cities";
const FLYWHEELS_REQUEST = "http://localhost:8000/api/v1/storages/flywheels";
const TIME_REQUEST = "http://localhost:8000/api/v1/sensors/datetime";
const CENTRAL_REQUEST = "http://localhost:8000/api/v1/sensors/emissions";
const WIND_REQUEST = "http://localhost:8000/api/v1/sensors/wind";
const SOLAR_REQUEST = "http://localhost:8000/api/v1/sensors/sun";

function Initialization(){
  request(FLYWHEELS_REQUEST, function (error, response, body) {
    let data = JSON.parse(body);
    data.forEach(flywheel => {
      flywheels.push(new Flywheel(flywheel.id,flywheel.size,flywheel.efficiency,flywheel.storage,flywheel.consumption,flywheel.power,flywheel.mode));
      let idDiv = document.createElement("p");
      idDiv.appendChild(document.createTextNode("Flywheel Id : " + flywheel.id));
      let powerDiv = document.createElement("p");
      powerDiv.appendChild(document.createTextNode("Consumption : " + Math.round(flywheel.consumption/1000) + " kW"));
      powerDiv.setAttribute('id', 'flyP2' + flywheel.id);
      let storageDiv = document.createElement("p");
      storageDiv.appendChild(document.createTextNode("Storage : " + Math.round(flywheel.storage*100) + " %"));
      storageDiv.setAttribute('id', 'flyS2' + flywheel.id);
      let modeDiv = document.createElement("p");
      modeDiv.appendChild(document.createTextNode("Mode : " + flywheel.mode));
      modeDiv.setAttribute('id', 'flyM2' + flywheel.id);
      let sizeDiv = document.createElement("p");
      sizeDiv.appendChild(document.createTextNode("Size : " + flywheel.size));
      sizeDiv.setAttribute('id', 'flyI2' + flywheel.id);
      let newDiv = document.createElement("div");
      newDiv.setAttribute('class', 'block sub_block');
      newDiv.appendChild(idDiv);
      newDiv.appendChild(powerDiv);
      newDiv.appendChild(storageDiv);
      newDiv.appendChild(modeDiv);
      newDiv.appendChild(sizeDiv);
      let currentDiv = document.getElementById("flywheelEnd2");
      let parentDiv = document.getElementById("flywheelParent2");
      parentDiv.insertBefore(newDiv, currentDiv);
      let idDiv2 = document.createElement("p");
      idDiv2.appendChild(document.createTextNode("Flywheel Id : " + flywheel.id));
      let powerDiv2 = document.createElement("p");
      powerDiv2.appendChild(document.createTextNode("Power : " + flywheel.power/1000 + " kW"));
      powerDiv2.setAttribute('id', 'flyP1' + flywheel.id);
      let storageDiv2 = document.createElement("p");
      storageDiv2.appendChild(document.createTextNode("Storage : " + Math.round(flywheel.storage*100) + " %"));
      storageDiv2.setAttribute('id', 'flyS1' + flywheel.id);
      let modeDiv2 = document.createElement("p");
      modeDiv2.appendChild(document.createTextNode("Mode : " + flywheel.mode));
      modeDiv2.setAttribute('id', 'flyM1' + flywheel.id);
      let sizeDiv2 = document.createElement("p");
      sizeDiv2.appendChild(document.createTextNode("Size : " + flywheel.size));
      sizeDiv2.setAttribute('id', 'flyI1' + flywheel.id);
      let newDiv2 = document.createElement("div");
      newDiv2.setAttribute('class', 'block sub_block');
      newDiv2.appendChild(idDiv2);
      newDiv2.appendChild(powerDiv2);
      newDiv2.appendChild(storageDiv2);
      newDiv2.appendChild(modeDiv2);
      newDiv2.appendChild(sizeDiv2);
      let currentDiv2 = document.getElementById("flywheelEnd1");
      let parentDiv2 = document.getElementById("flywheelParent1");
      parentDiv2.insertBefore(newDiv2, currentDiv2);
    });
    request(CENTRAL_REQUEST, function (error, response, body) {
      let data = JSON.parse(body);
      central.emission = data.emission;
      central.total = data.total;
      request(CITIES_REQUEST, function (error, response, body) {
        let data = JSON.parse(body);
        data.forEach(city => {
          let idDiv = document.createElement("p");
          idDiv.appendChild(document.createTextNode("City Id : " + city.id));
          idDiv.setAttribute('id', 'cityI' + city.id);
          let powerDiv = document.createElement("p");
          powerDiv.appendChild(document.createTextNode("Power : " + city.consumption / 1000 + " kW"));
          powerDiv.setAttribute('id', 'cityP' + city.id);
          let popDiv = document.createElement("p");
          popDiv.appendChild(document.createTextNode("Population : " + city.population));
          let rate = document.createElement("p");
          rate.appendChild(document.createTextNode("Rate : " + Math.round(city.consumption / city.population) + " W/U"));
          rate.setAttribute('id', 'cityR' + city.id);
          let newDiv = document.createElement("div");
          newDiv.setAttribute('class', 'block sub_block');
          newDiv.appendChild(idDiv);
          newDiv.appendChild(powerDiv);
          newDiv.appendChild(popDiv);
          newDiv.appendChild(rate);
          let currentDiv = document.getElementById("cityEnd");
          let parentDiv = document.getElementById("cityParent");
          parentDiv.insertBefore(newDiv, currentDiv);
        });
        request(SOLAR_PANEL_REQUEST, function (error, response, body) {
          let data = JSON.parse(body);
          data.forEach(solarPanel => {
            let rate = Math.round(solarPanel.power / solarPanel.size);
            let power = Math.round(solarPanel.power/ 1000);
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
          });
          request(WIND_TURBINE_REQUEST, function (error, response, body) {
            let data = JSON.parse(body);
            data.forEach(windTurbine => {
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
            });
            request(BARRAGE_REQUEST, function (error, response, body) {
              let data = JSON.parse(body);
              data.forEach(barrage => {
                let idDiv = document.createElement("p");
                idDiv.appendChild(document.createTextNode("Barrage Id : " + barrage.id));
                let powerDiv = document.createElement("p");
                powerDiv.appendChild(document.createTextNode("Power : " + barrage.power/1000 + " kW"));
                powerDiv.setAttribute('id','barrageP'+barrage.id);
                let locationDiv = document.createElement("p");
                locationDiv.appendChild(document.createTextNode("Location : Unknown"));
                let newDiv = document.createElement("div");
                newDiv.setAttribute('class', 'block sub_block');
                newDiv.appendChild(idDiv);
                newDiv.appendChild(powerDiv);
                newDiv.appendChild(locationDiv);
                let currentDiv = document.getElementById("barrageEnd");
                let parentDiv = document.getElementById("barrageParent");
                parentDiv.insertBefore(newDiv, currentDiv);
              });
            });
          });
        });
      });
    });
  });
}
function GettingData(){
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
  let fv1 = 0;
  let fv2 = 0;
  let total_consumer = 0;
  request(SOLAR_REQUEST, function (error, response, body) {
    let data = JSON.parse(body);
    solarAlt = Math.round((data.altitude*180)/6.28);
    solarAz = Math.round((data.azimuth*180)/6.28);
    request(WIND_REQUEST, function (error, response, body) {
      let data = JSON.parse(body);
      windSp = Math.round(data.speed);
      windAz = Math.round((data.azimuth*180)/6.28);
      request(TIME_REQUEST, function (error, response, body) {
        let data = JSON.parse(body);
        time = new Date(data.datetime);
        request(SOLAR_PANEL_REQUEST, function (error, response, body) {
          let data = JSON.parse(body);
          data.forEach(solarPanel => {
            sV += solarPanel.power;
            let rate = Math.round(solarPanel.power / solarPanel.size);
            let power = Math.round(solarPanel.power/ 1000);
            document.getElementById('solarP' + solarPanel.id).textContent = "Power : " + power + " kW";
            document.getElementById('solarR' + solarPanel.id).textContent = "Average : " + rate + " W/m²";
          });
          request(WIND_TURBINE_REQUEST, function (error, response, body) {
            let data = JSON.parse(body);
            data.forEach(windTurbine => {
              wV += windTurbine.power;
              const rate = Math.round(((windTurbine.power) / 1000) / windTurbine.number);
              document.getElementById("windP" + windTurbine.id).textContent = "Power : " + Math.round((windTurbine.power) / 1000) + " kW";
              document.getElementById("windR" + windTurbine.id).textContent = "Average : " + rate + " kW/U";
            });
            request(BARRAGE_REQUEST, function (error, response, body) {
              let data = JSON.parse(body);
              data.forEach(barrage => {
                bV += barrage.power;
                document.getElementById('barrageP' + barrage.id).textContent = "Power : " + barrage.power / 1000 + " kW";
              });
              request(CITIES_REQUEST, function (error, response, body) {
                let data = JSON.parse(body);
                data.forEach(city => {
                  cV += city.consumption;
                  document.getElementById("cityP" + city.id).textContent = "Power : " + city.consumption / 1000 + " kW";
                  document.getElementById("cityR" + city.id).textContent = "Av Power/Pop : " + city.consumption / city.population + " W/U";
                });
                //Got all data, calculating
                const generation = sV + wV + bV; //Watt
                const consumption = cV; //Watt
                const result = generation - consumption; //Watt
                if (result > 0) { //if we get extra power
                  let overflow = result; //Watt
                  flywheels.forEach(flywheel => {
                    const storage = flywheel.GetStorage(); //%
                    if (storage < 1 && overflow > 0) { //if the flywheel storage is not full
                      const maxConso = Math.min(40000, 40000 * 10 * (1 - storage));
                      flywheel.UpdateStorage(maxConso / 400000); //Watt --> Watt/h --> kWatt/h
                      flywheel.SetConsumption(maxConso);
                      fv1 += maxConso;
                      flywheel.SetMode("Consumer");
                      overflow -= maxConso;
                      total_consumer += maxConso;
                    }
                    if (storage === 1) {
                      flywheel.SetConsumption(0);
                      flywheel.SetMode("Idle");
                    }
                  });
                } else { //not enough power from producer
                  let resource = Math.abs(result); //power needed in Watt
                  flywheels.forEach(flywheel => {
                    if (flywheel.GetStorage() > 0) {
                      let maxPower = flywheel.GetStorage() * flywheelsMaxStorage * 365 * 1000; //power of the flywheel in Watt
                      if (maxPower > 40000) {
                        maxPower = 40000;
                      }
                      fv2 += Math.max(Math.round(maxPower), 0);
                      flywheel.SetPower(Math.max(Math.round(maxPower), 0));
                      flywheel.UpdateStorage(Math.min((-1) * maxPower / 400000), 0); //Watt --> Watt/h --> kWatt/h
                      flywheel.SetMode("Producer");
                      resource -= maxPower;
                    } else {
                      flywheel.SetMode("Producer");
                      flywheel.SetPower(0);
                    }

                  });
                  central.total = central.total + (resource * central.emission);
                  central.power = resource;
                  uV = resource;
                }
                const total_producer = Math.round((generation + uV) / 1000);
                total_consumer += Math.round(cV / 1000);
                sV = Math.round(sV / 1000);
                wV = Math.round(wV / 1000);
                bV = Math.round(bV / 1000);
                cV = Math.round(cV / 1000);
                uV = Math.round(uV / 1000);
                document.getElementById("speed").textContent = windSp + " m/s";
                document.getElementById("altitude").textContent = solarAlt + " °";
                document.getElementById("azimuthW").textContent = windAz + " °";
                document.getElementById("azimuthS").textContent = solarAz + " °";
                document.getElementById("sv").textContent = sV;
                document.getElementById("bv").textContent = bV;
                document.getElementById("wv").textContent = wV;
                document.getElementById("cv").textContent = cV;
                document.getElementById("cv2").textContent = cV;
                document.getElementById("uv").textContent = uV;
                document.getElementById("uv2").textContent = uV + " kW";
                document.getElementById("date").textContent = time.toString().slice(0, 24);
                document.getElementById('total_producer1').textContent = total_producer + " kW";
                document.getElementById('total_producer2').textContent = total_producer + " kW";
                document.getElementById('total_consumer1').textContent = total_consumer + " kW";
                document.getElementById('total_consumer2').textContent = total_consumer + " kW";
                document.getElementById("fv1").textContent = fv2 + " kW";
                document.getElementById("fv11").textContent = fv2 + " kW";
                document.getElementById("natural").textContent = (total_producer - fv2 - uV) + " kW";
                document.getElementById("fv2").textContent = fv1 + " kW";
                document.getElementById("fv22").textContent = fv1 + " kW";
                if (total_producer > total_consumer) {
                  document.getElementById("loosing").textContent = (total_producer - fv1 - cV) + " kW";
                } else {
                  document.getElementById("loosing").textContent = 0 + " kW";
                }
                flywheels.forEach(flywheel => {
                  document.getElementById('flyP2' + flywheel.GetId()).textContent = "Consumption : " + Math.round(flywheel.GetConsumption() / 1000) + " kW";
                  document.getElementById('flyS2' + flywheel.GetId()).textContent = "Storage : " + Math.round(flywheel.GetStorage() * 100) + " %";
                  document.getElementById('flyM2' + flywheel.GetId()).textContent = "Mode : " + flywheel.GetMode();
                  document.getElementById('flyP1' + flywheel.GetId()).textContent = "Power : " + flywheel.GetPower() / 1000 + " kW";
                  document.getElementById('flyS1' + flywheel.GetId()).textContent = "Storage : " + Math.round(flywheel.GetStorage() * 100) + " %";
                  document.getElementById('flyM1' + flywheel.GetId()).textContent = "Mode : " + flywheel.GetMode();
                });
                if (result > 0) { //if Flywheels are consumer
                  //add flywheels power
                  // we display consumer parent and hide the other one
                  document.getElementById("flywheelParent2").style.display = "";
                  document.getElementById("flywheelParent1").style.display = "none";
                } else {
                  document.getElementById("flywheelParent1").style.display = "";
                  document.getElementById("flywheelParent2").style.display = "none";
                }
              });
            });
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
          <div className={"block desc"}>
            <div>Producers : <span id="total_producer1">-</span></div>
            <div>&emsp;&emsp;(Natural : <span id={"natural"}>-</span> + Flywheels : <span id={"fv11"}>-</span> + Central : <span id={"uv2"}>-</span>)</div>
            <div>Consumer : <span id="total_consumer1">-</span> --> Loosing : <span id="loosing">-</span></div>
            <div>&emsp;&emsp;(Cities : <span id="cv2">-</span> + FlyWheels : <span id={"fv22"}>-</span>)</div>
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
              <p>Power : <span id="fv1">-</span></p>
            </div>
            <div id={"flywheelEnd1"}/>
          </div>
          <div className={"line centralParent"} id={"centralParent"}>
            <div id={"central"} className={"block main_block2"}>
              <p className={"block_title"}>Coal Central</p>
              <p>Power : <span id="uv">0</span> kW</p>
            </div>
            <div id={"centralEnd"}/>
          </div>
        </div>
        <div id={"Consumer"} className={"Consumer"}>
          <p className={"title"}>Consumers : <span id="total_consumer2">-</span></p>
          <div className={"line"} id={"cityParent"}>
            <div id={"city"} className={"block main_block2"}>
              <p className={"block_title"}>Cities</p>
              <p>Consumption : <span id="cv">-</span> kW</p>
            </div>
            <div id={"cityEnd"}/>
          </div>
          <div className={"line flywheelParent"} id={"flywheelParent2"}>
            <div id={"flywheel"} className={"block main_block"}>
              <p className={"block_title"}>Flywheels</p>
              <p>Consumption : <span id="fv2">-</span></p>
            </div>
            <div id={"flywheelEnd2"}/>
          </div>
        </div>
      </div>
  );
}

export default App;
