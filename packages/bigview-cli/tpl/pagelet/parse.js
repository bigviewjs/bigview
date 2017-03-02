'use strict';

const { changeStatus } = require('./const');
const { CHANGING, CHANGE_DONE} = changeStatus;

module.exports = function(pagelet) {
    let dataStore = pagelet.dataStore;
    let orderDetail = dataStore.orderDetail;
    let flightInfo = orderDetail.flightInfo || [];
    let flight = flightInfo[0] && flightInfo[0].flight || {};
    let flightStatusInfo = orderDetail.flightStatusInfo || [];

    // 改签部分使用
    let gqInfo = dataStore.gqInfo || {};
    let oldFlightInfo = gqInfo.oldFlightInfo;
    let newFlightInfo = gqInfo.newFlightInfo;
    let len = newFlightInfo ? newFlightInfo.length: 0;
    let gqStatus = [CHANGE_DONE, CHANGING];
    let orderStatus = orderDetail.orderStatus[0].status;

    let data = {
        goInfo: pickFlightInfo(newFlightInfo ? [newFlightInfo[0]] : flight.goInfos),
        backInfo: pickFlightInfo(len > 1 ? [newFlightInfo[len - 1]] : flight.backInfos),
        flightStatus: pickFlightStatus(flightStatusInfo)
    };

    data.gqInfo = pickGqInfo(gqInfo);//改签之前航班信息
    data.isGq = gqStatus.indexOf(orderStatus) > -1 && oldFlightInfo;
    data.isRound = !!data.backInfo;//是否为往返航班
    
    return Promise.resolve(data);
};

/**
 * 处理航班信息
 */
function pickFlightInfo(flightInfo) {
    if(!flightInfo || flightInfo.length == 0) {
        return null;
    }

    flightInfo.forEach(function(flight, index){
        flightInfo[index].depDateStr = parseDate(flight.depDate || flight.dptDate);
        flightInfo[index].arrDateStr = parseDate(flight.arrDate);

        // 处理hotdog和服务平台字段一致，dpt为服务平台格式
        flightInfo[index].depCity = flight.depCity || flight.dptCity;
        flightInfo[index].airlineShortName = flight.airlineShortName || flight.flightShortCo;
        flightInfo[index].depTime = flight.depTime || flight.dptTime;
        flightInfo[index].depAirport = flight.dptPort || flight.depAirport;
        flightInfo[index].arrAirport = flight.arrPort || flight.arrAirport;
        flightInfo[index].depTerminal = flight.depTerminal || flight.dptTerminal;
        flightInfo[index].arrAirport = flight.arrAirport || flight.arrPort;
        flightInfo[index].isShareFlight = flight.isShareFlight || flight.isShared;
        flightInfo[index].cabinDesc = flight.cabinDesc || flight.cabin;
    });

    return flightInfo;
}

/**
 * 处理航班动态信息
 */
function pickFlightStatus(flightStatusInfo) {
    let flightStatus = [];

    flightStatusInfo.forEach(function(curFlightStatus, index){
        let flightStatusItem = {
            isGo: !index,
            statusArr: [
                {
                    color: curFlightStatus.flightStatusColorCode,
                    title: curFlightStatus.label ? curFlightStatus.label + '程' : '',
                    value: curFlightStatus.flightStatus
                },
                {
                    title: '值机柜台',
                    value: curFlightStatus.checkinCounter
                },
                {
                    title: '登机口',
                    value: curFlightStatus.boardgate
                },
                {
                    title: '行李转盘',
                    value: curFlightStatus.baggageTurntable
                }
            ]
        };

        flightStatus.push(flightStatusItem);
    });

    return flightStatus;
}

/**
 * 处理改签信息
 */
function pickGqInfo(gqInfo) {
    let oldFlight = gqInfo.oldFlightInfo || [];
    let len = oldFlight.length;
    let goInfo = oldFlight[0];

    gqInfo.oldGoInfo = goInfo;

    if(!len){
        return null;
    }

    // 处理改签前 去程航班信息（格式化日期）
    gqInfo.oldGoInfo.depDateStr = parseDate(goInfo.dptDate);
    gqInfo.oldGoInfo.arrDateStr = parseDate(goInfo.arrDate);

    // 处理改签前 返程航班信息（格式化日期）
    if(len > 1){
        let backInfo = oldFlight[len - 1];
        gqInfo.oldBackInfo = backInfo;

        gqInfo.oldBackInfo.depDateStr = parseDate(backInfo.dptDate);
        gqInfo.oldBackInfo.arrDateStr = parseDate(backInfo.arrDate);
    }

    return gqInfo;
}

/**
 * 处理日期格式
 */
function parseDate(date) {
    if(!date){
        return '';
    }

    return date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$2-$3');
}
