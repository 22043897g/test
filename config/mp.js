/**
 * Create with recorderModule
 * Author: ChrisChiu
 * Date: 2023/3/20
 * Desc
 */

module.exports = [
    /* 测量点 */
    {
        location: "431232",
        location_id: "42321",
        sensor: {
            OIL: "Current Oil Volume",
            WATER: "Current Water Volume"
        },
        wells: [
            /* 测量点下的三项井 */
            {
                uniqueIdGAS: "0x544e69723937647569544a694f5469596a65416b570000000000000000000000",
                location: "14-01-077-01W6 Group",
                location_id: "996987",
                sensor: {
                    GAS: "Gas Flow Rate",
                },
            },

        ]
    },
    /* 没有测量点的三项井 */
    // {
    //     uniqueIdGAS: "0x366b42616f7738664c74736b3479694d32415037680000000000000000000000",
    //     location: "12323",
    //     location_id: "35231",
    //     sensor: {
    //         GAS: "Volume3"
    //     },
    // },
    // {
    //     uniqueIdOIL: "0x6a593973356e634d6e6c536a644e4c4d3076304f570000000000000000000000",
    //     location: "12323",
    //     location_id: "35231",
    //     sensor: {
    //         OIL: "Current Oil Volume2",
    //     },
    // }
]
