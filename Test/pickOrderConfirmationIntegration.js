import { getStagedSecret } from '../../env/secrets.js';
import pactum from 'pactum';
import { pubsubEncode } from '../../test_utils.js';

const apigeeHostUrl = await getStagedSecret("apigee-host-url");
const endpoint = `${apigeeHostUrl}/integration/wms/warehouse-robots/robotPickOrderConfirmation`;
const { spec } = pactum;

// Use SCT if sent in command line (e.g., ' STAGE=tst SCT=[true|false] npm run test:system-geek '), default to false
const shouldCallTargets = process.env.SCT ? process.env.SCT : "false";

var requestPayload = {
    "header": {
        "user_id": "MYJ",
        "warehouse_code": "MW",
        "interface_code": "feedback_outbound_order",
        "user_key": "96e79218965eb72c92a549dd5a330112"
    },
    "body": {
        "order_amount": 1,
        "order_list": [
            {
                "pick_type": 0,
                "plan_sku_amount": 2,
                "container_amount": 1,
                "warehouse_code": "MW",
                "owner_code": "MYJ",
                "pickup_sku_amount": 2,
                "is_exception": 0,
                "finish_date": 1728472853920,
                "lack_flag": 0,
                "out_order_code": "2/4321/30862",
                "order_type": 26,
                "status": 3
            }
        ]
    }
}

describe(`POST pick confirmation Geek with 1 item, 1 piece ${endpoint}`, () => {
    const _spec = spec();

    requestPayload.body.order_list[0].container_list = [
        {
            "sku_type_amount": 1,
            "container_code": "2234567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 1,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        }
    ]

    requestPayload.body.order_list[0].sku_list = [
        {
            "sku_level": 0,
            "item": 1,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/1234",
            "pickup_amount": 1,
            "plan_amount": 1,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        }
    ];

    const encoded_body = pubsubEncode(requestPayload);

    const expectedResponse = {
        "pickBatchYear": 2,
        "pickBatchNumber": 4321,
        "endLocationNumber": 30862,
        "pickedList": [
            {
                "sku": "MJ0318515000OS0L",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL"
                ],
                "containerCodeList": [
                    "000000002234567890"
                ],
                "pickupAmountList": [
                    1
                ],
                "totalPickedQuantity": 1,
                "yearNumber": 2,
                "pickNumber": 1234,
                "status": "To be confirmed",
                "attempt": 1
            }
        ]
    }

    it('should return 200 status code', async () => {
        await _spec
            .post(`${endpoint}`)
            .withQueryParams('shouldCallTargets', shouldCallTargets)
            .withJson(encoded_body)
            .withRequestTimeout(10000)
            .expectStatus(200)
            .expectJsonMatch(expectedResponse);
    });
});

describe(`POST pick confirmation Geek with >1 items, >1 pieces ${endpoint}`, () => {
    const _spec = spec();

    requestPayload.body.order_list[0].container_list = [
        {
            "sku_type_amount": 1,
            "container_code": "2234567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 4,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 7,
                    "item": 2,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0M",
                    "sn_list": []
                }
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        }
    ]

    requestPayload.body.order_list[0].sku_list = [
        {
            "sku_level": 0,
            "item": 1,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/1234",
            "pickup_amount": 4,
            "plan_amount": 4,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        },
        {
            "sku_level": 0,
            "item": 2,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/5678",
            "pickup_amount": 7,
            "plan_amount": 7,
            "sku_code": "MJ0318515000OS0M",
            "sn_list": []
        }
    ];

    const encoded_body = pubsubEncode(requestPayload);

    const expectedResponse = {
        "pickBatchYear": 2,
        "pickBatchNumber": 4321,
        "endLocationNumber": 30862,
        "pickedList": [
            {
                "sku": "MJ0318515000OS0L",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL"
                ],
                "containerCodeList": [
                    "000000002234567890"
                ],
                "pickupAmountList": [
                    4
                ],
                "totalPickedQuantity": 4,
                "yearNumber": 2,
                "pickNumber": 1234,
                "status": "To be confirmed",
                "attempt": 1
            },
            {
                "sku": "MJ0318515000OS0M",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL"
                ],
                "containerCodeList": [
                    "000000002234567890"
                ],
                "pickupAmountList": [
                    7
                ],
                "totalPickedQuantity": 7,
                "yearNumber": 2,
                "pickNumber": 5678,
                "status": "To be confirmed",
                "attempt": 1
            }
        ]
    }

    it('should return 200 status code', async () => {
        await _spec
            .post(`${endpoint}`)
            .withQueryParams('shouldCallTargets', shouldCallTargets)
            .withJson(encoded_body)
            .withRequestTimeout(10000)
            .expectStatus(200)
            .expectJsonMatch(expectedResponse);
    });
});

describe(`POST pick confirmation Geek with >1 items, >1 containers ${endpoint}`, () => {
    // At most 2 containers, if more than 2 is executed, the multiscan pretty muched forked it with measuring the dimensions
    const _spec = spec();

    requestPayload.body.order_list[0].container_list = [
        {
            "sku_type_amount": 3,
            "container_code": "2234567890",
            "sku_amount": 3,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 2,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 7,
                    "item": 2,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0M",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 2,
                    "item": 3,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0S",
                    "sn_list": []
                }
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        },
        {
            "sku_type_amount": 1,
            "container_code": "3334567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 3,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 6,
                    "item": 2,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0M",
                    "sn_list": []
                }
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        },

    ]

    requestPayload.body.order_list[0].sku_list = [
        {
            "sku_level": 0,
            "item": 1,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/1234",
            "pickup_amount": 5,
            "plan_amount": 5,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        },
        {
            "sku_level": 0,
            "item": 2,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/5678",
            "pickup_amount": 13,
            "plan_amount": 13,
            "sku_code": "MJ0318515000OS0M",
            "sn_list": []
        },
        {
            "sku_level": 0,
            "item": 3,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/9012",
            "pickup_amount": 2,
            "plan_amount": 2,
            "sku_code": "MJ0318515000OS0S",
            "sn_list": []
        }
    ];

    const encoded_body = pubsubEncode(requestPayload);

    const expectedResponse = {
        "pickBatchYear": 2,
        "pickBatchNumber": 4321,
        "endLocationNumber": 30862,
        "pickedList": [
            {
                "sku": "MJ0318515000OS0L",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL", "PDL"
                ],
                "containerCodeList": [
                    "000000002234567890",
                    "000000003334567890"
                ],
                "pickupAmountList": [
                    2, 3
                ],
                "totalPickedQuantity": 5,
                "yearNumber": 2,
                "pickNumber": 1234,
                "status": "To be confirmed",
                "attempt": 1
            },
            {
                "sku": "MJ0318515000OS0M",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL", "PDL"
                ],
                "containerCodeList": [
                    "000000002234567890",
                    "000000003334567890"
                ],
                "pickupAmountList": [
                    7, 6
                ],
                "totalPickedQuantity": 13,
                "yearNumber": 2,
                "pickNumber": 5678,
                "status": "To be confirmed",
                "attempt": 1
            },
            {
                "sku": "MJ0318515000OS0S",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL"
                ],
                "containerCodeList": [
                    "000000002234567890"
                ],
                "pickupAmountList": [
                    2
                ],
                "totalPickedQuantity": 2,
                "yearNumber": 2,
                "pickNumber": 9012,
                "status": "To be confirmed",
                "attempt": 1
            }
        ]
    }

    it('should return 200 status code', async () => {
        await _spec
            .post(`${endpoint}`)
            .withQueryParams('shouldCallTargets', shouldCallTargets)
            .withJson(encoded_body)
            .withRequestTimeout(10000)
            .expectStatus(200)
            .expectJsonMatch(expectedResponse);
    });
});

describe(`POST pick confirmation Geek with >1 picklines for 1 item ${endpoint}`, () => {
    const _spec = spec();

    requestPayload.body.order_list[0].container_list = [
        {
            "sku_type_amount": 1,
            "container_code": "2234567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 4,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 7,
                    "item": 2,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        }
    ]

    requestPayload.body.order_list[0].sku_list = [
        {
            "sku_level": 0,
            "item": 1,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/1234",
            "pickup_amount": 4,
            "plan_amount": 4,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        },
        {
            "sku_level": 0,
            "item": 2,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/5678",
            "pickup_amount": 7,
            "plan_amount": 7,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        }
    ];

    const encoded_body = pubsubEncode(requestPayload);

    const expectedResponse = {
        "pickBatchYear": 2,
        "pickBatchNumber": 4321,
        "endLocationNumber": 30862,
        "pickedList": [
            {
                "sku": "MJ0318515000OS0L",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL"
                ],
                "containerCodeList": [
                    "000000002234567890"
                ],
                "pickupAmountList": [
                    4
                ],
                "totalPickedQuantity": 4,
                "yearNumber": 2,
                "pickNumber": 1234,
                "status": "To be confirmed",
                "attempt": 1
            },
            {
                "sku": "MJ0318515000OS0L",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL"
                ],
                "containerCodeList": [
                    "000000002234567890"
                ],
                "pickupAmountList": [
                    7
                ],
                "totalPickedQuantity": 7,
                "yearNumber": 2,
                "pickNumber": 5678,
                "status": "To be confirmed",
                "attempt": 1
            }
        ]
    }

    it('should return 200 status code', async () => {
        await _spec
            .post(`${endpoint}`)
            .withQueryParams('shouldCallTargets', shouldCallTargets)
            .withJson(encoded_body)
            .withRequestTimeout(10000)
            .expectStatus(200)
            .expectJsonMatch(expectedResponse);
    });
});

describe(`POST pick confirmation Geek with >1 picklines for 1 item, >1 containers ${endpoint}`, () => {
    const _spec = spec();

    requestPayload.body.order_list[0].container_list = [
        {
            "sku_type_amount": 1,
            "container_code": "2234567890",
            "sku_amount": 2,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 2,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 5,
                    "item": 2,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        },
        {
            "sku_type_amount": 1,
            "container_code": "5534567890",
            "sku_amount": 2,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 2,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 2,
                    "item": 2,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        }
    ]

    requestPayload.body.order_list[0].sku_list = [
        {
            "sku_level": 0,
            "item": 1,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/1234",
            "pickup_amount": 4,
            "plan_amount": 4,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        },
        {
            "sku_level": 0,
            "item": 2,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/5678",
            "pickup_amount": 7,
            "plan_amount": 7,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        }
    ];

    const encoded_body = pubsubEncode(requestPayload);

    const expectedResponse = {
        "pickBatchYear": 2,
        "pickBatchNumber": 4321,
        "endLocationNumber": 30862,
        "pickedList": [
            {
                "sku": "MJ0318515000OS0L",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL", "PDS"
                ],
                "containerCodeList": [
                    "000000002234567890", "000000005534567890"
                ],
                "pickupAmountList": [
                    2, 2
                ],
                "totalPickedQuantity": 4,
                "yearNumber": 2,
                "pickNumber": 1234,
                "status": "To be confirmed",
                "attempt": 1
            },
            {
                "sku": "MJ0318515000OS0L",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL", "PDS"
                ],
                "containerCodeList": [
                    "000000002234567890", "000000005534567890"
                ],
                "pickupAmountList": [
                    5, 2
                ],
                "totalPickedQuantity": 7,
                "yearNumber": 2,
                "pickNumber": 5678,
                "status": "To be confirmed",
                "attempt": 1
            }
        ]
    }

    it('should return 200 status code', async () => {
        await _spec
            .post(`${endpoint}`)
            .withQueryParams('shouldCallTargets', shouldCallTargets)
            .withJson(encoded_body)
            .withRequestTimeout(10000)
            .expectStatus(200)
            .expectJsonMatch(expectedResponse);
    });
});

describe(`POST pick confirmation Geek with all cartonTypeCodes ${endpoint}`, () => {
    const _spec = spec();

    requestPayload.body.order_list[0].container_list = [
        {
            "sku_type_amount": 1,
            "container_code": "1134567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 1,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        },
        {
            "sku_type_amount": 1,
            "container_code": "2234567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 1,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        },
        {
            "sku_type_amount": 1,
            "container_code": "3334567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 1,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        },
        {
            "sku_type_amount": 1,
            "container_code": "4434567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 1,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        },
        {
            "sku_type_amount": 1,
            "container_code": "5534567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 1,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        },
        {
            "sku_type_amount": 1,
            "container_code": "6634567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 1,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        }
    ]

    requestPayload.body.order_list[0].sku_list = [
        {
            "sku_level": 0,
            "item": 1,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/1234",
            "pickup_amount": 6,
            "plan_amount": 6,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        }
    ];

    const encoded_body = pubsubEncode(requestPayload);

    const expectedResponse = {
        "pickBatchYear": 2,
        "pickBatchNumber": 4321,
        "endLocationNumber": 30862,
        "pickedList": [
            {
                "sku": "MJ0318515000OS0L",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BGR", "BKL", "PDL", "PDM", "PDS", "WD1"
                ],
                "containerCodeList": [
                    "000000001134567890", "000000002234567890", "000000003334567890", "000000004434567890", "000000005534567890", "000000006634567890"
                ],
                "pickupAmountList": [
                    1, 1, 1, 1, 1, 1
                ],
                "totalPickedQuantity": 6,
                "yearNumber": 2,
                "pickNumber": 1234,
                "status": "To be confirmed",
                "attempt": 1
            }
        ]
    }

    it('should return 200 status code', async () => {
        await _spec
            .post(`${endpoint}`)
            .withQueryParams('shouldCallTargets', shouldCallTargets)

            .withJson(encoded_body)
            .withRequestTimeout(10000)
            .expectStatus(200)
            .expectJsonMatch(expectedResponse);
    });
});


describe(`POST pick confirmation Geek with 1 pickline + shortage ${endpoint}`, () => {
    const _spec = spec();

    requestPayload.body.order_list[0].container_list = [
        {
            "sku_type_amount": 1,
            "container_code": "2234567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 0,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                }
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        }
    ]

    requestPayload.body.order_list[0].sku_list = [
        {
            "sku_level": 0,
            "item": 1,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/1234",
            "pickup_amount": 0,
            "plan_amount": 1,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        }
    ];

    const encoded_body = pubsubEncode(requestPayload);

    const expectedResponse = {
        "pickBatchYear": 2,
        "pickBatchNumber": 4321,
        "endLocationNumber": 30862,
        "pickedList": [
            {
                "sku": "MJ0318515000OS0L",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL"
                ],
                "containerCodeList": [
                    "000000002234567890"
                ],
                "pickupAmountList": [
                    0
                ],
                "totalPickedQuantity": 0,
                "yearNumber": 2,
                "pickNumber": 1234,
                "status": "To be confirmed",
                "attempt": 1
            }
        ]
    }

    it('should return 200 status code', async () => {
        await _spec
            .post(`${endpoint}`)
            .withQueryParams('shouldCallTargets', shouldCallTargets)
            .withJson(encoded_body)
            .withRequestTimeout(10000)
            .expectStatus(200)
            .expectJsonMatch(expectedResponse);
    });
});

describe(`POST pick confirmation Geek with 1 item, >1 picklines + shortage ${endpoint}`, () => {
    const _spec = spec();

    requestPayload.body.order_list[0].container_list = [
        {
            "sku_type_amount": 1,
            "container_code": "2234567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 3,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 0,
                    "item": 2,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        }
    ]

    requestPayload.body.order_list[0].sku_list = [
        {
            "sku_level": 0,
            "item": 1,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/1234",
            "pickup_amount": 3,
            "plan_amount": 13,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        },
        {
            "sku_level": 0,
            "item": 2,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/5678",
            "pickup_amount": 0,
            "plan_amount": 6,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        }
    ];

    const encoded_body = pubsubEncode(requestPayload);

    const expectedResponse = {
        "pickBatchYear": 2,
        "pickBatchNumber": 4321,
        "endLocationNumber": 30862,
        "pickedList": [
            {
                "sku": "MJ0318515000OS0L",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL"
                ],
                "containerCodeList": [
                    "000000002234567890"
                ],
                "pickupAmountList": [
                    3
                ],
                "totalPickedQuantity": 3,
                "yearNumber": 2,
                "pickNumber": 1234,
                "status": "To be confirmed",
                "attempt": 1
            },
            {
                "sku": "MJ0318515000OS0L",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL"
                ],
                "containerCodeList": [
                    "000000002234567890"
                ],
                "pickupAmountList": [
                    0
                ],
                "totalPickedQuantity": 0,
                "yearNumber": 2,
                "pickNumber": 5678,
                "status": "To be confirmed",
                "attempt": 1
            }
        ]
    }

    it('should return 200 status code', async () => {
        await _spec
            .post(`${endpoint}`)
            .withQueryParams('shouldCallTargets', shouldCallTargets)
            .withJson(encoded_body)
            .withRequestTimeout(10000)
            .expectStatus(200)
            .expectJsonMatch(expectedResponse);
    });
});

describe(`POST pick confirmation Geek with >1 items + shortage ${endpoint}`, () => {
    const _spec = spec();

    requestPayload.body.order_list[0].container_list = [
        {
            "sku_type_amount": 3,
            "container_code": "2234567890",
            "sku_amount": 3,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 2,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 7,
                    "item": 2,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0M",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 0,
                    "item": 3,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0S",
                    "sn_list": []
                }
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        }
    ]

    requestPayload.body.order_list[0].sku_list = [
        {
            "sku_level": 0,
            "item": 1,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/1234",
            "pickup_amount": 2,
            "plan_amount": 4,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        },
        {
            "sku_level": 0,
            "item": 2,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/5678",
            "pickup_amount": 7,
            "plan_amount": 7,
            "sku_code": "MJ0318515000OS0M",
            "sn_list": []
        },
        {
            "sku_level": 0,
            "item": 3,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/9012",
            "pickup_amount": 0,
            "plan_amount": 9,
            "sku_code": "MJ0318515000OS0S",
            "sn_list": []
        }
    ];

    const encoded_body = pubsubEncode(requestPayload);

    const expectedResponse = {
        "pickBatchYear": 2,
        "pickBatchNumber": 4321,
        "endLocationNumber": 30862,
        "pickedList": [
            {
                "sku": "MJ0318515000OS0L",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL"
                ],
                "containerCodeList": [
                    "000000002234567890"
                ],
                "pickupAmountList": [
                    2
                ],
                "totalPickedQuantity": 2,
                "yearNumber": 2,
                "pickNumber": 1234,
                "status": "To be confirmed",
                "attempt": 1
            },
            {
                "sku": "MJ0318515000OS0M",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL"
                ],
                "containerCodeList": [
                    "000000002234567890"
                ],
                "pickupAmountList": [
                    7
                ],
                "totalPickedQuantity": 7,
                "yearNumber": 2,
                "pickNumber": 5678,
                "status": "To be confirmed",
                "attempt": 1
            },
            {
                "sku": "MJ0318515000OS0S",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL"
                ],
                "containerCodeList": [
                    "000000002234567890"
                ],
                "pickupAmountList": [
                    0
                ],
                "totalPickedQuantity": 0,
                "yearNumber": 2,
                "pickNumber": 9012,
                "status": "To be confirmed",
                "attempt": 1
            }
        ]
    }

    it('should return 200 status code', async () => {
        await _spec
            .post(`${endpoint}`)
            .withQueryParams('shouldCallTargets', shouldCallTargets)
            .withJson(encoded_body)
            .withRequestTimeout(10000)
            .expectStatus(200)
            .expectJsonMatch(expectedResponse);
    });
});

describe(`POST pick confirmation Geek, all 200 scenario's in one ${endpoint}`, () => {
    const _spec = spec();

    requestPayload.body.order_list[0].container_list = [
        {
            "sku_type_amount": 3,
            "container_code": "2234567890",
            "sku_amount": 3,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 1,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 24,
                    "item": 2,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0M",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 11,
                    "item": 3,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0S",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 43,
                    "item": 4,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0S",
                    "sn_list": []
                }
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        },
        {
            "sku_type_amount": 3,
            "container_code": "5534567890",
            "sku_amount": 3,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 27,
                    "item": 2,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0M",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 10,
                    "item": 3,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0S",
                    "sn_list": []
                },
                {
                    "sku_level": 0,
                    "amount": 38,
                    "item": 4,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0S",
                    "sn_list": []
                }
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        }
    ]

    requestPayload.body.order_list[0].sku_list = [
        {
            "sku_level": 0,
            "item": 1,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/1234",
            "pickup_amount": 1,
            "plan_amount": 1,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        },
        {
            "sku_level": 0,
            "item": 2,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/5678",
            "pickup_amount": 51,
            "plan_amount": 51,
            "sku_code": "MJ0318515000OS0M",
            "sn_list": []
        },
        {
            "sku_level": 0,
            "item": 3,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/9012",
            "pickup_amount": 21,
            "plan_amount": 30,
            "sku_code": "MJ0318515000OS0S",
            "sn_list": []
        },
        {
            "sku_level": 0,
            "item": 4,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/3456",
            "pickup_amount": 81,
            "plan_amount": 85,
            "sku_code": "MJ0318515000OS0S",
            "sn_list": []
        }
    ];

    const encoded_body = pubsubEncode(requestPayload);

    const expectedResponse = {
        "pickBatchYear": 2,
        "pickBatchNumber": 4321,
        "endLocationNumber": 30862,
        "pickedList": [
            {
                "sku": "MJ0318515000OS0L",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL"
                ],
                "containerCodeList": [
                    "000000002234567890"
                ],
                "pickupAmountList": [
                    1
                ],
                "totalPickedQuantity": 1,
                "yearNumber": 2,
                "pickNumber": 1234,
                "status": "To be confirmed",
                "attempt": 1
            },
            {
                "sku": "MJ0318515000OS0M",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL", "PDS"
                ],
                "containerCodeList": [
                    "000000002234567890", "000000005534567890"
                ],
                "pickupAmountList": [
                    24, 27
                ],
                "totalPickedQuantity": 51,
                "yearNumber": 2,
                "pickNumber": 5678,
                "status": "To be confirmed",
                "attempt": 1
            },
            {
                "sku": "MJ0318515000OS0S",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL", "PDS"
                ],
                "containerCodeList": [
                    "000000002234567890", "000000005534567890"
                ],
                "pickupAmountList": [
                    11, 10
                ],
                "totalPickedQuantity": 21,
                "yearNumber": 2,
                "pickNumber": 9012,
                "status": "To be confirmed",
                "attempt": 1
            },
            {
                "sku": "MJ0318515000OS0S",
                "lastActionOnPick": true,
                "cartonTypeCodeList": [
                    "BKL", "PDS"
                ],
                "containerCodeList": [
                    "000000002234567890", "000000005534567890"
                ],
                "pickupAmountList": [
                    43, 38
                ],
                "totalPickedQuantity": 81,
                "yearNumber": 2,
                "pickNumber": 3456,
                "status": "To be confirmed",
                "attempt": 1
            }
        ]
    }

    it('should return 200 status code', async () => {
        await _spec
            .post(`${endpoint}`)
            .withQueryParams('shouldCallTargets', shouldCallTargets)
            .withJson(encoded_body)
            .withRequestTimeout(10000)
            .expectStatus(200)
            .expectJsonMatch(expectedResponse);
    });
});

describe(`POST pick confirmation Geek with invalid pick year number and pick number ${endpoint}`, () => {
    const _spec = spec();

    requestPayload.body.order_list[0].container_list = [
        {
            "sku_type_amount": 1,
            "container_code": "2234567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 4,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                }
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        }
    ]

    requestPayload.body.order_list[0].sku_list = [
        {
            "sku_level": 0,
            "item": 1,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "PurposedlyWrongTypeForPickYear/PurposedlyWrongTypeForPickNumber",
            "pickup_amount": 4,
            "plan_amount": 4,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        }
    ];

    const encoded_body = pubsubEncode(requestPayload);

    it('should return 400 status code', async () => {
        await _spec
            .post(`${endpoint}`)
            .withQueryParams('shouldCallTargets', shouldCallTargets)
            .withJson(encoded_body)
            .withRequestTimeout(10000)
            .expectStatus(400);
    });
});

describe(`POST pick confirmation Geek with invalid out_order_code ${endpoint}`, () => {
    const _spec = spec();

    requestPayload.body.order_list[0].container_list = [
        {
            "sku_type_amount": 1,
            "container_code": "2234567890",
            "sku_amount": 1,
            "sku_list": [
                {
                    "sku_level": 0,
                    "amount": 4,
                    "item": 1,
                    "out_batch_code": "",
                    "production_date": -3600000,
                    "bar_code": "",
                    "owner_code": "MYJ",
                    "expiration_date": 4070905200000,
                    "sku_code": "MJ0318515000OS0L",
                    "sn_list": []
                }
            ],
            "creation_date": 1728472887124,
            "picker": "ApigeeTest"
        }
    ]

    requestPayload.body.order_list[0].sku_list = [
        {
            "sku_level": 0,
            "item": 1,
            "out_batch_code": "",
            "bar_code": "",
            "owner_code": "MYJ",
            "remark": "2/1234",
            "pickup_amount": 4,
            "plan_amount": 4,
            "sku_code": "MJ0318515000OS0L",
            "sn_list": []
        }
    ];

    requestPayload.body.order_list[0].out_order_code = "purposedlyWrongTypeForPickBatchYear/purposedlyWrongTypeForPickBatchNumber/noValidEndLocation";

    const encoded_body = pubsubEncode(requestPayload);

    it('should return 400 status code', async () => {
        await _spec
            .post(`${endpoint}`)
            .withQueryParams('shouldCallTargets', shouldCallTargets)
            .withJson(encoded_body)
            .withRequestTimeout(10000)
            .expectStatus(400);
    });
});