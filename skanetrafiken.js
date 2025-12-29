const API_BASE = 'https://www.skanetrafiken.se/gw-tps/api/v2';

const headers = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'sv-SE',
  'search-engine-environment': 'TjP'
};

/**
 * Search for points (stops/locations) by name
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of point objects
 */
export async function searchPoints(query) {
  const url = `${API_BASE}/Points?name=${encodeURIComponent(query)}`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.points || [];
}

/**
 * Plan a journey between two points
 * @param {Object} options - Journey options
 * @param {Object} options.fromPoint - Origin point object
 * @param {Object} options.toPoint - Destination point object
 * @param {Date} options.departureTime - Departure time (optional)
 * @param {boolean} options.arrival - Whether time is arrival time (default: false)
 * @param {string} options.priority - Priority (default: SHORTEST_TIME)
 * @param {number} options.journeysAfter - Number of journeys to return (default: 5)
 * @param {string} options.walkSpeed - Walking speed (default: NORMAL)
 * @param {number} options.maxWalkDistance - Max walk distance in meters (default: 2000)
 * @param {boolean} options.allowWalkToOtherStop - Allow walking to other stops (default: true)
 * @returns {Promise<Object>} Journey data
 * example response
{
    "api": "se.skanetrafiken.api",
    "time": "2025-12-23T18:00:04Z",
    "usedSearchTime": "2025-12-23T17:35:00Z",
    "refreshRateSeconds": 30,
    "id": "aa29ba0468c74b0cb7b66001db2d4120",
    "journeys": [
        {
            "id": 0,
            "sequenceNo": 0,
            "noOfChanges": 0,
            "routeLinks": [
                {
                    "from": {
                        "name": "Malmö Hyllie",
                        "time": "2025-12-23T17:34:00Z",
                        "deviation": 8,
                        "passed": true,
                        "coordinate": {
                            "lat": 55.562792,
                            "lon": 12.975828
                        },
                        "id2": "9021012080040000",
                        "timePoint": false
                    },
                    "to": {
                        "name": "Malmö Hyllie Vattenpark",
                        "time": "2025-12-23T17:34:00Z",
                        "deviation": 8,
                        "passed": true,
                        "coordinate": {
                            "lat": 55.564705,
                            "lon": 12.977689
                        },
                        "id2": "9021012080054000",
                        "timePoint": false
                    },
                    "line": {
                        "name": "Gång",
                        "type": "Walk",
                        "lineNo": 0,
                        "color": "FFFFFFFF",
                        "outlineColor": "FF999593",
                        "iconColor": "FF3E3B39",
                        "towards": "",
                        "distance": "41 m",
                        "occupancySupport": false
                    },
                    "deviations": [],
                    "path": "klcrImvenA@C@@L`@@??XAp@CA?T"
                },
                {
                    "id": "ST¤SE¤276¤ServiceJourney¤1120000389583423|2025-12-23",
                    "from": {
                        "name": "Malmö Hyllie Vattenpark",
                        "time": "2025-12-23T17:34:00Z",
                        "pos": "Läge K",
                        "stopPointCoordinate": {
                            "lat": 55.564316,
                            "lon": 12.977193
                        },
                        "deviation": 8,
                        "passed": true,
                        "coordinate": {
                            "lat": 55.564705,
                            "lon": 12.977689
                        },
                        "id2": "9021012080054000",
                        "timePoint": false
                    },
                    "to": {
                        "name": "Malmö Tenorgatan",
                        "time": "2025-12-23T17:43:00Z",
                        "pos": "Läge B",
                        "stopPointCoordinate": {
                            "lat": 55.556665,
                            "lon": 13.008721
                        },
                        "deviation": 10,
                        "passed": true,
                        "coordinate": {
                            "lat": 55.556733,
                            "lon": 13.008177
                        },
                        "id2": "9021012080622000",
                        "timePoint": false
                    },
                    "line": {
                        "name": "Stadsbuss",
                        "type": "Bus",
                        "no": "9",
                        "lineNo": 12000009,
                        "lineNoString": "ST:SE:276:Line:9011012000900000",
                        "color": "FF3EA827",
                        "outlineColor": "FF307120",
                        "iconColor": "FFFFFFFF",
                        "towards": "mot Östra hamnen via Jägersro",
                        "runNo": 159,
                        "subType": "City_Bus",
                        "occupancySupport": false,
                        "operatorId": "ST:SE:276:Authority:9010012000000000",
                        "operatorName": "Skånetrafiken",
                        "gid": "9015012000900159"
                    },
                    "deviations": [],
                    "path": "{kcrI_senA?Ab@Bt@D@BFALBJHLPHD@?JH??RBl@D@?|DVJ@J?rAJN@N?@y@???A@i@DwCBsBBUFc@@A??Fg@BqBHcGFkE@aAFuE?A?S??BqA@e@WAA???GA{BYo@M??}@]i@Ui@Uo@UIAGEA?SGCKCICIEGCi@@]HmB@a@RFL@D@tATDyGAYGSCOCS?W@qA???o@?C???A@i@?C@qC@{@?O?[?K@c@@SDQJSJSFOFSDU@_BBwC?C??BoB@yC?C???Q?C@_@@aAA]?a@Aa@Co@Gq@NI`@U^URWTSRYPWTa@Vi@\\}@BGDK???CBE@EFSJc@PcAjBgJDUNs@VmAVsAFUHYHWHUJWFOHSLWNSJOPSLMJMfEgEx@}@`@e@HKJQR]??@????AN]N]DE@G???AFMHSJYDODML_@Ji@F_@Pw@Jo@Ju@Do@Fy@D{@JeH?A@]?E?AB_B?O",
                    "operatingDayDate": "2025-12-23"
                },
                {
                    "from": {
                        "name": "Malmö Tenorgatan",
                        "time": "2025-12-23T17:43:00Z",
                        "deviation": 10,
                        "passed": true,
                        "coordinate": {
                            "lat": 55.556733,
                            "lon": 13.008177
                        },
                        "id2": "9021012080622000",
                        "timePoint": false
                    },
                    "to": {
                        "name": "Vald position",
                        "time": "2025-12-23T17:47:00Z",
                        "deviation": 10,
                        "passed": true
                    },
                    "line": {
                        "name": "Gång",
                        "type": "Walk",
                        "lineNo": 0,
                        "color": "FFFFFFFF",
                        "outlineColor": "FF999593",
                        "iconColor": "FF3E3B39",
                        "towards": "",
                        "distance": "327 m",
                        "occupancySupport": false
                    },
                    "deviations": [],
                    "path": "c|arIowknA@@AXIvA?\\C|@CtAcAIBgAUCsBSBaABgA@cAw@I"
                }
            ]
        },
        {
            "id": 1,
            "sequenceNo": 0,
            "noOfChanges": 0,
            "routeLinks": [
                {
                    "from": {
                        "name": "Malmö Hyllie",
                        "time": "2025-12-23T17:49:00Z",
                        "passed": true,
                        "coordinate": {
                            "lat": 55.562792,
                            "lon": 12.975828
                        },
                        "id2": "9021012080040000",
                        "timePoint": false
                    },
                    "to": {
                        "name": "Malmö Hyllie Vattenpark",
                        "time": "2025-12-23T17:49:00Z",
                        "passed": true,
                        "coordinate": {
                            "lat": 55.564705,
                            "lon": 12.977689
                        },
                        "id2": "9021012080054000",
                        "timePoint": false
                    },
                    "line": {
                        "name": "Gång",
                        "type": "Walk",
                        "lineNo": 0,
                        "color": "FFFFFFFF",
                        "outlineColor": "FF999593",
                        "iconColor": "FF3E3B39",
                        "towards": "",
                        "distance": "41 m",
                        "occupancySupport": false
                    },
                    "deviations": [],
                    "path": "klcrImvenA@C@@L`@@??XAp@CA?T"
                },
                {
                    "id": "ST¤SE¤276¤ServiceJourney¤1120000389583480|2025-12-23",
                    "from": {
                        "name": "Malmö Hyllie Vattenpark",
                        "time": "2025-12-23T17:49:00Z",
                        "pos": "Läge K",
                        "stopPointCoordinate": {
                            "lat": 55.564316,
                            "lon": 12.977193
                        },
                        "passed": true,
                        "coordinate": {
                            "lat": 55.564705,
                            "lon": 12.977689
                        },
                        "id2": "9021012080054000",
                        "timePoint": false
                    },
                    "to": {
                        "name": "Malmö Tenorgatan",
                        "time": "2025-12-23T17:58:00Z",
                        "pos": "Läge B",
                        "stopPointCoordinate": {
                            "lat": 55.556665,
                            "lon": 13.008721
                        },
                        "passed": true,
                        "coordinate": {
                            "lat": 55.556733,
                            "lon": 13.008177
                        },
                        "id2": "9021012080622000",
                        "timePoint": false
                    },
                    "line": {
                        "name": "Stadsbuss",
                        "type": "Bus",
                        "no": "9",
                        "lineNo": 12000009,
                        "lineNoString": "ST:SE:276:Line:9011012000900000",
                        "color": "FF3EA827",
                        "outlineColor": "FF307120",
                        "iconColor": "FFFFFFFF",
                        "towards": "mot Östra hamnen via Jägersro",
                        "runNo": 161,
                        "subType": "City_Bus",
                        "occupancySupport": false,
                        "operatorId": "ST:SE:276:Authority:9010012000000000",
                        "operatorName": "Skånetrafiken",
                        "gid": "9015012000900161"
                    },
                    "deviations": [],
                    "path": "{kcrI_senA?Ab@Bt@D@BFALBJHLPHD@?JH??RBl@D@?|DVJ@J?rAJN@N?@y@???A@i@DwCBsBBUFc@@A??Fg@BqBHcGFkE@aAFuE?A?S??BqA@e@WAA???GA{BYo@M??}@]i@Ui@Uo@UIAGEA?SGCKCICIEGCi@@]HmB@a@RFL@D@tATDyGAYGSCOCS?W@qA???o@?C???A@i@?C@qC@{@?O?[?K@c@@SDQJSJSFOFSDU@_BBwC?C??BoB@yC?C???Q?C@_@@aAA]?a@Aa@Co@Gq@NI`@U^URWTSRYPWTa@Vi@\\}@BGDK???CBE@EFSJc@PcAjBgJDUNs@VmAVsAFUHYHWHUJWFOHSLWNSJOPSLMJMfEgEx@}@`@e@HKJQR]??@????AN]N]DE@G???AFMHSJYDODML_@Ji@F_@Pw@Jo@Ju@Do@Fy@D{@JeH?A@]?E?AB_B?O",
                    "operatingDayDate": "2025-12-23"
                },
                {
                    "from": {
                        "name": "Malmö Tenorgatan",
                        "time": "2025-12-23T17:58:00Z",
                        "passed": true,
                        "coordinate": {
                            "lat": 55.556733,
                            "lon": 13.008177
                        },
                        "id2": "9021012080622000",
                        "timePoint": false
                    },
                    "to": {
                        "name": "Vald position",
                        "time": "2025-12-23T18:03:00Z"
                    },
                    "line": {
                        "name": "Gång",
                        "type": "Walk",
                        "lineNo": 0,
                        "color": "FFFFFFFF",
                        "outlineColor": "FF999593",
                        "iconColor": "FF3E3B39",
                        "towards": "",
                        "distance": "327 m",
                        "occupancySupport": false
                    },
                    "deviations": [],
                    "path": "c|arIowknA@@AXIvA?\\C|@CtAcAIBgAUCsBSBaABgA@cAw@I"
                }
            ]
        },
        {
            "id": 2,
            "sequenceNo": 0,
            "noOfChanges": 0,
            "routeLinks": [
                {
                    "from": {
                        "name": "Malmö Hyllie",
                        "time": "2025-12-23T18:03:00Z",
                        "deviation": -1,
                        "coordinate": {
                            "lat": 55.562792,
                            "lon": 12.975828
                        },
                        "id2": "9021012080040000",
                        "timePoint": false
                    },
                    "to": {
                        "name": "Malmö Hyllie Vattenpark",
                        "time": "2025-12-23T18:04:00Z",
                        "deviation": -1,
                        "coordinate": {
                            "lat": 55.564705,
                            "lon": 12.977689
                        },
                        "id2": "9021012080054000",
                        "timePoint": false
                    },
                    "line": {
                        "name": "Gång",
                        "type": "Walk",
                        "lineNo": 0,
                        "color": "FFFFFFFF",
                        "outlineColor": "FF999593",
                        "iconColor": "FF3E3B39",
                        "towards": "",
                        "distance": "41 m",
                        "occupancySupport": false
                    },
                    "deviations": [],
                    "path": "klcrImvenA@C@@L`@@??XAp@CA?T"
                },
                {
                    "id": "ST¤SE¤276¤ServiceJourney¤1120000389583537|2025-12-23",
                    "from": {
                        "name": "Malmö Hyllie Vattenpark",
                        "time": "2025-12-23T18:04:00Z",
                        "pos": "Läge K",
                        "stopPointCoordinate": {
                            "lat": 55.564316,
                            "lon": 12.977193
                        },
                        "deviation": -1,
                        "coordinate": {
                            "lat": 55.564705,
                            "lon": 12.977689
                        },
                        "id2": "9021012080054000",
                        "timePoint": false
                    },
                    "to": {
                        "name": "Malmö Tenorgatan",
                        "time": "2025-12-23T18:13:00Z",
                        "pos": "Läge B",
                        "stopPointCoordinate": {
                            "lat": 55.556665,
                            "lon": 13.008721
                        },
                        "deviation": -3,
                        "coordinate": {
                            "lat": 55.556733,
                            "lon": 13.008177
                        },
                        "id2": "9021012080622000",
                        "timePoint": false
                    },
                    "line": {
                        "name": "Stadsbuss",
                        "type": "Bus",
                        "no": "9",
                        "lineNo": 12000009,
                        "lineNoString": "ST:SE:276:Line:9011012000900000",
                        "color": "FF3EA827",
                        "outlineColor": "FF307120",
                        "iconColor": "FFFFFFFF",
                        "towards": "mot Östra hamnen via Jägersro",
                        "runNo": 163,
                        "subType": "City_Bus",
                        "occupancySupport": false,
                        "operatorId": "ST:SE:276:Authority:9010012000000000",
                        "operatorName": "Skånetrafiken",
                        "gid": "9015012000900163"
                    },
                    "deviations": [],
                    "path": "{kcrI_senA?Ab@Bt@D@BFALBJHLPHD@?JH??RBl@D@?|DVJ@J?rAJN@N?@y@???A@i@DwCBsBBUFc@@A??Fg@BqBHcGFkE@aAFuE?A?S??BqA@e@WAA???GA{BYo@M??}@]i@Ui@Uo@UIAGEA?SGCKCICIEGCi@@]HmB@a@RFL@D@tATDyGAYGSCOCS?W@qA???o@?C???A@i@?C@qC@{@?O?[?K@c@@SDQJSJSFOFSDU@_BBwC?C??BoB@yC?C???Q?C@_@@aAA]?a@Aa@Co@Gq@NI`@U^URWTSRYPWTa@Vi@\\}@BGDK???CBE@EFSJc@PcAjBgJDUNs@VmAVsAFUHYHWHUJWFOHSLWNSJOPSLMJMfEgEx@}@`@e@HKJQR]??@????AN]N]DE@G???AFMHSJYDODML_@Ji@F_@Pw@Jo@Ju@Do@Fy@D{@JeH?A@]?E?AB_B?O",
                    "operatingDayDate": "2025-12-23"
                },
                {
                    "from": {
                        "name": "Malmö Tenorgatan",
                        "time": "2025-12-23T18:13:00Z",
                        "deviation": -3,
                        "coordinate": {
                            "lat": 55.556733,
                            "lon": 13.008177
                        },
                        "id2": "9021012080622000",
                        "timePoint": false
                    },
                    "to": {
                        "name": "Vald position",
                        "time": "2025-12-23T18:17:00Z",
                        "deviation": -3
                    },
                    "line": {
                        "name": "Gång",
                        "type": "Walk",
                        "lineNo": 0,
                        "color": "FFFFFFFF",
                        "outlineColor": "FF999593",
                        "iconColor": "FF3E3B39",
                        "towards": "",
                        "distance": "327 m",
                        "occupancySupport": false
                    },
                    "deviations": [],
                    "path": "c|arIowknA@@AXIvA?\\C|@CtAcAIBgAUCsBSBaABgA@cAw@I"
                }
            ]
        },
        {
            "id": 3,
            "sequenceNo": 0,
            "noOfChanges": 0,
            "routeLinks": [
                {
                    "from": {
                        "name": "Malmö Hyllie",
                        "time": "2025-12-23T18:14:00Z",
                        "coordinate": {
                            "lat": 55.562792,
                            "lon": 12.975828
                        },
                        "id2": "9021012080040000",
                        "timePoint": false
                    },
                    "to": {
                        "name": "Malmö Hyllie Vattenpark",
                        "time": "2025-12-23T18:15:00Z",
                        "coordinate": {
                            "lat": 55.564705,
                            "lon": 12.977689
                        },
                        "id2": "9021012080054000",
                        "timePoint": false
                    },
                    "line": {
                        "name": "Gång",
                        "type": "Walk",
                        "lineNo": 0,
                        "color": "FFFFFFFF",
                        "outlineColor": "FF999593",
                        "iconColor": "FF3E3B39",
                        "towards": "",
                        "distance": "38 m",
                        "occupancySupport": false
                    },
                    "deviations": [],
                    "path": "klcrImvenA@C@@L`@KAOAGO@E"
                },
                {
                    "id": "ST¤SE¤276¤ServiceJourney¤1120000387328950|2025-12-23",
                    "from": {
                        "name": "Malmö Hyllie Vattenpark",
                        "time": "2025-12-23T18:15:00Z",
                        "pos": "Läge B",
                        "stopPointCoordinate": {
                            "lat": 55.564464,
                            "lon": 12.977801
                        },
                        "coordinate": {
                            "lat": 55.564705,
                            "lon": 12.977689
                        },
                        "id2": "9021012080054000",
                        "timePoint": true
                    },
                    "to": {
                        "name": "Malmö Lindängen",
                        "time": "2025-12-23T18:21:00Z",
                        "pos": "Läge B",
                        "stopPointCoordinate": {
                            "lat": 55.558571,
                            "lon": 13.012692
                        },
                        "coordinate": {
                            "lat": 55.558774,
                            "lon": 13.012535
                        },
                        "id2": "9021012080600000",
                        "timePoint": false
                    },
                    "line": {
                        "name": "Regionbuss",
                        "type": "Bus",
                        "no": "170",
                        "lineNo": 12000170,
                        "lineNoString": "ST:SE:276:Line:9011012017000000",
                        "color": "FFFEC900",
                        "outlineColor": "FFCC9B00",
                        "iconColor": "FF3E3B39",
                        "towards": "mot Lund Norra Fäladen via LTH",
                        "runNo": 64,
                        "subType": "Regional_Bus",
                        "occupancySupport": false,
                        "operatorId": "ST:SE:276:Authority:9010012000000000",
                        "operatorName": "Skånetrafiken",
                        "gid": "9015012017000064"
                    },
                    "deviations": [],
                    "path": "ylcrIswenAH?HJFPFTAn@Cl@aAEoCUoBM??A?UE@}@???CBuA@e@@oA?AHeF@}A@_@BWBUBYDKFWzAcEJSPg@R]PYPMVQTGRCP@N@t@LZFRDl@F@[@UBe@Ck@H}AFaAHADEFEDIDIBMBO@K?O?OAOCKCICIEGCi@@]HmB@a@RFL@D@tATDyGAYGSCOCS?W@qA???o@?C@k@?C@qC@{@?O?[?K@c@@SDQJSJSFOFSDU@_BB{CBoB@yC?U??@c@@aAA]?a@Aa@Co@Gq@NI`@U^URWTSRYPWTa@Vi@\\}@HS????BIHYJc@PcAjBgJTiAVmAVsAFUHYHWHUJWFOHSLWNSJOPSLMJMfEgEx@}@`@e@HKJQT]?A??N]Tc@@G???APa@JYDODML_@Ji@F_@Pw@Jo@Ju@Do@Fy@D{@JgH??@]?E??BaB@aA@]C[CWESK[EEAA??CEQQOGqGaC[I?C??]M?A@C?C?AAC?A?C?AAC???AACAC?AA?Ae@A_@@g@@i@L_DD{@",
                    "operatingDayDate": "2025-12-23"
                },
                {
                    "from": {
                        "name": "Malmö Lindängen",
                        "time": "2025-12-23T18:21:00Z",
                        "coordinate": {
                            "lat": 55.558774,
                            "lon": 13.012535
                        },
                        "id2": "9021012080600000",
                        "timePoint": false
                    },
                    "to": {
                        "name": "Vald position",
                        "time": "2025-12-23T18:26:00Z"
                    },
                    "line": {
                        "name": "Gång",
                        "type": "Walk",
                        "lineNo": 0,
                        "color": "FFFFFFFF",
                        "outlineColor": "FF999593",
                        "iconColor": "FF3E3B39",
                        "towards": "",
                        "distance": "394 m",
                        "occupancySupport": false
                    },
                    "deviations": [],
                    "path": "ahbrIiplnAC?Bg@HEBM?M@]SCMlCAXKfDCp@?^@`@@\\BFDFFFHHVNd@VExBA\\ANR@EfCt@J"
                }
            ]
        }
    ],
    "prevCursor": "MnxQUkVWSU9VU19QQUdFfDIwMjUtMTItMjNUMTY6NTM6MDBafHw0Mm18U1RSRUVUX0FORF9BUlJJVkFMX1RJTUV8fHx8fHw0MDI5fA==",
    "nextCursor": "MnxORVhUX1BBR0V8MjAyNS0xMi0yM1QxODoxNzowMFp8fDQybXxTVFJFRVRfQU5EX0FSUklWQUxfVElNRXx8fHx8fDQwMjl8",
    "tooLongWalkJourneys": [
        {
            "walkToFirstStop": true,
            "walkFromLastStop": false
        }
    ]
}
 */
export async function planJourney(options) {
  const {
    fromPoint,
    toPoint,
    departureTime = new Date(),
    arrival = false,
    priority = 'SHORTEST_TIME',
    journeysAfter = 5,
    walkSpeed = 'NORMAL',
    maxWalkDistance = 2000,
    allowWalkToOtherStop = true
  } = options;
  
  // Handle fromPoint
  let fromPointId = fromPoint.id2;
  let fromPointType = fromPoint.type;
  
  if (fromPoint.type === 'ADDRESS') {
    fromPointId = `${fromPoint.lat}#${fromPoint.lon}`;
    fromPointType = 'LOCATION';
  }
  
  // Handle toPoint
  let toPointId = toPoint.id2;
  let toPointType = toPoint.type;
  
  if (toPoint.type === 'ADDRESS') {
    toPointId = `${toPoint.lat}#${toPoint.lon}`;
    toPointType = 'LOCATION';
  }

  const params = new URLSearchParams({
    fromPointId,
    fromPointType,
    toPointId,
    toPointType,
    departure: departureTime.toISOString(),
    arrival: arrival.toString(),
    priority,
    isBobCapable: 'false',
    journeysAfter: journeysAfter.toString(),
    walkSpeed,
    maxWalkDistance: maxWalkDistance.toString(),
    allowWalkToOtherStop: allowWalkToOtherStop.toString()
  });

  const url = `${API_BASE}/Journey?${params.toString()}`;
  
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Select the best point from search results
 * Prefers STOP_AREA over LOCATION
 * @param {Array} points - Array of point objects
 * @returns {Object|null} Best matching point or null
 */
export function selectBestPoint(points) {
  if (!points || points.length === 0) {
    return null;
  }

  // const stopAreas = points.filter(p => p.type === 'STOP_AREA');
  // if (stopAreas.length > 0) {
  //   return stopAreas[0];
  // }

  return points[0];
}

/**
 * Calculate journey time from planJourney response
 * @param {Object} journeyResponse - Response from planJourney
 * @param {number} journeyIndex - Index of journey to calculate (default: 0 for fastest)
 * @returns {Object|null} Journey time info or null if no journeys
 * 
 * @example
 * const timeInfo = calculateJourneyTime(journeyResponse);
 * // Returns: { totalMinutes: 47, hours: 0, minutes: 47, formatted: "47m" }
 */
export function calculateJourneyTime(journeyResponse, journeyIndex = 0) {
  if (!journeyResponse || !journeyResponse.journeys || journeyResponse.journeys.length === 0) {
    return null;
  }
  
  if (journeyIndex >= journeyResponse.journeys.length) {
    return null;
  }
  
  const journey = journeyResponse.journeys[journeyIndex];
  const routeLinks = journey.routeLinks;
  
  if (!routeLinks || routeLinks.length === 0) {
    return null;
  }
  
  // Get start time from first route link
  const startTime = new Date(routeLinks[0].from.time);
  
  // Get end time from last route link
  const endTime = new Date(routeLinks[routeLinks.length - 1].to.time);
  
  // Calculate total duration in minutes
  const totalMinutes = Math.round((endTime - startTime) / (1000 * 60));
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  let formatted;
  if (hours > 0) {
    formatted = `${hours}h ${minutes}m`;
  } else {
    formatted = `${minutes}m`;
  }
  
  return {
    totalMinutes,
    hours,
    minutes,
    formatted,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString()
  };
}
