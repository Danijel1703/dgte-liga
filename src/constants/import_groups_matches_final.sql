
-- 🚨 IMPORTANT PRE-REQUISITES 🚨

-- 1. EXTENSIONS: Ensure the 'uuid-ossp' extension is enabled for gen_random_uuid():
--    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPE: Ensure the custom 'match_status' type exists in your database:
--    CREATE TYPE public.match_status AS ENUM ('waiting', 'completed', 'surrender');

-- 3. EXECUTION: Run the entire script as a single block/transaction.

-- =======================================================================
-- 1. SOURCE DATA CTEs: JSON content embedded here
-- =======================================================================
WITH
groups_json (j) AS (
    SELECT '{
  "meta": {
    "format": "JSON",
    "version": "1.1.0",
    "projectId": "dgte-liga",
    "resourcePath": ["groups"],
    "recursive": false,
    "creationTime": 1759116111,
    "app": "firefoo"
  },
  "data": {
    "ED7mtUTRQcA3XKnAlopL": {
      "color": "#ed6c02",
      "createdAt": { "__time__": "2025-08-23T12:30:56.671Z" },
      "memberIds": [
        "ciuWwLPeorZ69cbXfDWvTTICM6P2",
        "wWP3cINFXSRptkwXPsL394GTS1q1",
        "WMuGrVVIJfYb8rdj4GxLIvh8kBh2",
        "wfqmXUC9htZkEyUOo3s5K8d0w9G2"
      ],
      "members": [
        { "id": "ciuWwLPeorZ69cbXfDWvTTICM6P2" },
        { "id": "wWP3cINFXSRptkwXPsL394GTS1q1" },
        { "id": "WMuGrVVIJfYb8rdj4GxLIvh8kBh2" },
        { "id": "wfqmXUC9htZkEyUOo3s5K8d0w9G2" }
      ],
      "name": "Skupina 5",
      "__collections__": {
        "matches": {
          "17J9ied3DV9edrDLblkq": {
            "groupId": "ED7mtUTRQcA3XKnAlopL",
            "id": "17J9ied3DV9edrDLblkq",
            "playerOneId": "ciuWwLPeorZ69cbXfDWvTTICM6P2",
            "playerTwoId": "wWP3cINFXSRptkwXPsL394GTS1q1",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 7, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 1, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "ciuWwLPeorZ69cbXfDWvTTICM6P2",
            "__collections__": {}
          },
          "Vk2V9QLDZSDR93eiALWp": {
            "groupId": "ED7mtUTRQcA3XKnAlopL",
            "id": "Vk2V9QLDZSDR93eiALWp",
            "playerOneId": "ciuWwLPeorZ69cbXfDWvTTICM6P2",
            "playerTwoId": "WMuGrVVIJfYb8rdj4GxLIvh8kBh2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 1, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 1, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "WMuGrVVIJfYb8rdj4GxLIvh8kBh2",
            "__collections__": {}
          },
          "Y0oKBzCXDVoQTbEKbepS": {
            "groupId": "ED7mtUTRQcA3XKnAlopL",
            "id": "Y0oKBzCXDVoQTbEKbepS",
            "playerOneId": "wWP3cINFXSRptkwXPsL394GTS1q1",
            "playerTwoId": "WMuGrVVIJfYb8rdj4GxLIvh8kBh2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 1, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "WMuGrVVIJfYb8rdj4GxLIvh8kBh2",
            "__collections__": {}
          },
          "aZ19FJl5HQpjg656mGsu": {
            "groupId": "ED7mtUTRQcA3XKnAlopL",
            "id": "aZ19FJl5HQpjg656mGsu",
            "playerOneId": "ciuWwLPeorZ69cbXfDWvTTICM6P2",
            "playerTwoId": "wfqmXUC9htZkEyUOo3s5K8d0w9G2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "qGpkKggWy2F49hPKxZw8": {
            "groupId": "ED7mtUTRQcA3XKnAlopL",
            "playerOneId": "wWP3cINFXSRptkwXPsL394GTS1q1",
            "playerTwoId": "wfqmXUC9htZkEyUOo3s5K8d0w9G2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "tzIvYe6LB3H0rB0e4wf8": {
            "groupId": "ED7mtUTRQcA3XKnAlopL",
            "id": "tzIvYe6LB3H0rB0e4wf8",
            "playerOneId": "WMuGrVVIJfYb8rdj4GxLIvh8kBh2",
            "playerTwoId": "wfqmXUC9htZkEyUOo3s5K8d0w9G2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 1, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "WMuGrVVIJfYb8rdj4GxLIvh8kBh2",
            "__collections__": {}
          }
        }
      }
    },
    "IYPBThNjr1kRKPUTG0iM": {
      "color": "#1976d2",
      "createdAt": { "__time__": "2025-08-23T12:30:21.276Z" },
      "memberIds": [
        "uQU4tEsYEeSdt6n2xHLXZkngrex1",
        "qjoXNj7h3XMaqshxiRDuH3KJsxG3",
        "pqpZKupNWVgPsXeqm7cNm9KX69G3",
        "KgwTrqmSqROmSkWfc7FePW3hOjm1"
      ],
      "members": [
        { "id": "uQU4tEsYEeSdt6n2xHLXZkngrex1" },
        { "id": "qjoXNj7h3XMaqshxiRDuH3KJsxG3" },
        { "id": "pqpZKupNWVgPsXeqm7cNm9KX69G3" },
        { "id": "KgwTrqmSqROmSkWfc7FePW3hOjm1" }
      ],
      "name": "Skupina 2",
      "__collections__": {
        "matches": {
          "32pbTmnFzE9nEGNr8MvH": {
            "groupId": "IYPBThNjr1kRKPUTG0iM",
            "id": "32pbTmnFzE9nEGNr8MvH",
            "playerOneId": "uQU4tEsYEeSdt6n2xHLXZkngrex1",
            "playerTwoId": "KgwTrqmSqROmSkWfc7FePW3hOjm1",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "uQU4tEsYEeSdt6n2xHLXZkngrex1",
            "__collections__": {}
          },
          "NubRoppLd29o2KLp5w68": {
            "groupId": "IYPBThNjr1kRKPUTG0iM",
            "id": "NubRoppLd29o2KLp5w68",
            "playerOneId": "uQU4tEsYEeSdt6n2xHLXZkngrex1",
            "playerTwoId": "pqpZKupNWVgPsXeqm7cNm9KX69G3",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 1, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "uQU4tEsYEeSdt6n2xHLXZkngrex1",
            "__collections__": {}
          },
          "QUdiWTzVQFbK44xh59n3": {
            "groupId": "IYPBThNjr1kRKPUTG0iM",
            "playerOneId": "qjoXNj7h3XMaqshxiRDuH3KJsxG3",
            "playerTwoId": "KgwTrqmSqROmSkWfc7FePW3hOjm1",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "b0AkrwGZNJzidcTOTHpR": {
            "groupId": "IYPBThNjr1kRKPUTG0iM",
            "playerOneId": "pqpZKupNWVgPsXeqm7cNm9KX69G3",
            "playerTwoId": "KgwTrqmSqROmSkWfc7FePW3hOjm1",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "nLe8p8TeIASZN35JocY1": {
            "groupId": "IYPBThNjr1kRKPUTG0iM",
            "id": "nLe8p8TeIASZN35JocY1",
            "playerOneId": "qjoXNj7h3XMaqshxiRDuH3KJsxG3",
            "playerTwoId": "pqpZKupNWVgPsXeqm7cNm9KX69G3",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 1, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 3, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "qjoXNj7h3XMaqshxiRDuH3KJsxG3",
            "__collections__": {}
          },
          "rMA5qQl7ktjWYAL2hJFs": {
            "groupId": "IYPBThNjr1kRKPUTG0iM",
            "playerOneId": "uQU4tEsYEeSdt6n2xHLXZkngrex1",
            "playerTwoId": "qjoXNj7h3XMaqshxiRDuH3KJsxG3",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          }
        }
      }
    },
    "O2QbmzMrsA3hB0jkC5ll": {
      "color": "#2e7d32",
      "createdAt": { "__time__": "2025-08-23T12:31:14.447Z" },
      "memberIds": [
        "XHKuOIhDiRYIu1zFUbMdNXNECPG3",
        "bNCsSiOW0teYIFRuxXC4SELij3Z2",
        "XgqxD2zw15gI8fROqj6xPQ1b2ux1",
        "YOrrIrvpooVWCRWX9gzs5EjLCD43"
      ],
      "members": [
        { "id": "XHKuOIhDiRYIu1zFUbMdNXNECPG3" },
        { "id": "bNCsSiOW0teYIFRuxXC4SELij3Z2" },
        { "id": "XgqxD2zw15gI8fROqj6xPQ1b2ux1" },
        { "id": "YOrrIrvpooVWCRWX9gzs5EjLCD43" }
      ],
      "name": "Skupina 6",
      "__collections__": {
        "matches": {
          "DwLozKmqylHoItmOIBwb": {
            "groupId": "O2QbmzMrsA3hB0jkC5ll",
            "playerOneId": "bNCsSiOW0teYIFRuxXC4SELij3Z2",
            "playerTwoId": "YOrrIrvpooVWCRWX9gzs5EjLCD43",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "Fmdrcands2ocn5wC5IwT": {
            "groupId": "O2QbmzMrsA3hB0jkC5ll",
            "playerOneId": "XgqxD2zw15gI8fROqj6xPQ1b2ux1",
            "playerTwoId": "YOrrIrvpooVWCRWX9gzs5EjLCD43",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "JoIowW0Nd8CEeGUgyKgs": {
            "groupId": "O2QbmzMrsA3hB0jkC5ll",
            "playerOneId": "XHKuOIhDiRYIu1zFUbMdNXNECPG3",
            "playerTwoId": "XgqxD2zw15gI8fROqj6xPQ1b2ux1",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "e4EcDyPqjmqSgm5B6h5g": {
            "groupId": "O2QbmzMrsA3hB0jkC5ll",
            "playerOneId": "XHKuOIhDiRYIu1zFUbMdNXNECPG3",
            "playerTwoId": "YOrrIrvpooVWCRWX9gzs5EjLCD43",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "ethYlSpERQQ9UoH5YirY": {
            "groupId": "O2QbmzMrsA3hB0jkC5ll",
            "playerOneId": "bNCsSiOW0teYIFRuxXC4SELij3Z2",
            "playerTwoId": "XgqxD2zw15gI8fROqj6xPQ1b2ux1",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "hslwf4SMKIVmqc9Z0tC5": {
            "groupId": "O2QbmzMrsA3hB0jkC5ll",
            "id": "hslwf4SMKIVmqc9Z0tC5",
            "playerOneId": "XHKuOIhDiRYIu1zFUbMdNXNECPG3",
            "playerTwoId": "bNCsSiOW0teYIFRuxXC4SELij3Z2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 4, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 3, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "XHKuOIhDiRYIu1zFUbMdNXNECPG3",
            "__collections__": {}
          }
        }
      }
    },
    "SfzRkComlQXLMLawFmP2": {
      "color": "#0288d1",
      "createdAt": { "__time__": "2025-08-23T12:31:38.680Z" },
      "memberIds": [
        "oqANEgkBfob6l0pocroQMTdbR5r1",
        "laSQqPrCOGNQAkwhIigNsNdAG4D2",
        "8VZYwhTifqg6C4JDuFjcMLjNxp62",
        "9cMJ5qlhovaSAjA1Rdp1wUdqrBJ2"
      ],
      "members": [
        { "id": "oqANEgkBfob6l0pocroQMTdbR5r1" },
        { "id": "laSQqPrCOGNQAkwhIigNsNdAG4D2" },
        { "id": "8VZYwhTifqg6C4JDuFjcMLjNxp62" },
        { "id": "9cMJ5qlhovaSAjA1Rdp1wUdqrBJ2" }
      ],
      "name": "Skupina 7",
      "__collections__": {
        "matches": {
          "0wx7mRSGaoPlHMkvxcLr": {
            "groupId": "SfzRkComlQXLMLawFmP2",
            "id": "0wx7mRSGaoPlHMkvxcLr",
            "playerOneId": "oqANEgkBfob6l0pocroQMTdbR5r1",
            "playerTwoId": "8VZYwhTifqg6C4JDuFjcMLjNxp62",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "oqANEgkBfob6l0pocroQMTdbR5r1",
            "__collections__": {}
          },
          "5XYxMHJqINEi2AG3DOuN": {
            "groupId": "SfzRkComlQXLMLawFmP2",
            "playerOneId": "laSQqPrCOGNQAkwhIigNsNdAG4D2",
            "playerTwoId": "8VZYwhTifqg6C4JDuFjcMLjNxp62",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "7SSC1F2tCLi2NgYt3oUF": {
            "groupId": "SfzRkComlQXLMLawFmP2",
            "id": "7SSC1F2tCLi2NgYt3oUF",
            "playerOneId": "laSQqPrCOGNQAkwhIigNsNdAG4D2",
            "playerTwoId": "9cMJ5qlhovaSAjA1Rdp1wUdqrBJ2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 3, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 7, "setNumber": 2 },
              { "playerOneGames": 10, "playerTwoGames": 5, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "laSQqPrCOGNQAkwhIigNsNdAG4D2",
            "__collections__": {}
          },
          "iCmg8yg1GD7eJn4mHOUL": {
            "groupId": "SfzRkComlQXLMLawFmP2",
            "id": "iCmg8yg1GD7eJn4mHOUL",
            "playerOneId": "oqANEgkBfob6l0pocroQMTdbR5r1",
            "playerTwoId": "9cMJ5qlhovaSAjA1Rdp1wUdqrBJ2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 3, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 3, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "oqANEgkBfob6l0pocroQMTdbR5r1",
            "__collections__": {}
          },
          "pX5DDUlTYV2ehcYorJ9w": {
            "groupId": "SfzRkComlQXLMLawFmP2",
            "id": "pX5DDUlTYV2ehcYorJ9w",
            "playerOneId": "8VZYwhTifqg6C4JDuFjcMLjNxp62",
            "playerTwoId": "9cMJ5qlhovaSAjA1Rdp1wUdqrBJ2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 1, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "9cMJ5qlhovaSAjA1Rdp1wUdqrBJ2",
            "__collections__": {}
          },
          "xaG3dET976MRxM7UiUoq": {
            "groupId": "SfzRkComlQXLMLawFmP2",
            "id": "xaG3dET976MRxM7UiUoq",
            "playerOneId": "oqANEgkBfob6l0pocroQMTdbR5r1",
            "playerTwoId": "laSQqPrCOGNQAkwhIigNsNdAG4D2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 7, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 7, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "oqANEgkBfob6l0pocroQMTdbR5r1",
            "__collections__": {}
          }
        }
      }
    },
    "eBaR4JUBAaMe2isz4tAs": {
      "color": "#d32f2f",
      "createdAt": { "__time__": "2025-08-23T12:30:43.121Z" },
      "memberIds": [
        "0QeiGLftDWSGhb3rye4lO7Gmvsr2",
        "g3n98fHe82f26hXfXIxFg9Wuv9k1",
        "bSP0oL0zRPZnwLrPTWD1qR6uQzv1",
        "Tdv8C8b6Q5ZJTEDxqfdRlHAUj6L2"
      ],
      "members": [
        { "id": "0QeiGLftDWSGhb3rye4lO7Gmvsr2" },
        { "id": "g3n98fHe82f26hXfXIxFg9Wuv9k1" },
        { "id": "bSP0oL0zRPZnwLrPTWD1qR6uQzv1" },
        { "id": "Tdv8C8b6Q5ZJTEDxqfdRlHAUj6L2" }
      ],
      "name": "Skupina 4",
      "__collections__": {
        "matches": {
          "G35ygMENYedyhZ1yXyCP": {
            "groupId": "eBaR4JUBAaMe2isz4tAs",
            "playerOneId": "g3n98fHe82f26hXfXIxFg9Wuv9k1",
            "playerTwoId": "Tdv8C8b6Q5ZJTEDxqfdRlHAUj6L2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "TzIXBAONR5H3l6ui6DHE": {
            "groupId": "eBaR4JUBAaMe2isz4tAs",
            "id": "TzIXBAONR5H3l6ui6DHE",
            "playerOneId": "bSP0oL0zRPZnwLrPTWD1qR6uQzv1",
            "playerTwoId": "Tdv8C8b6Q5ZJTEDxqfdRlHAUj6L2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 2, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "Tdv8C8b6Q5ZJTEDxqfdRlHAUj6L2",
            "__collections__": {}
          },
          "ZTiqw3NogVDEq95m8aWM": {
            "groupId": "eBaR4JUBAaMe2isz4tAs",
            "id": "ZTiqw3NogVDEq95m8aWM",
            "playerOneId": "0QeiGLftDWSGhb3rye4lO7Gmvsr2",
            "playerTwoId": "Tdv8C8b6Q5ZJTEDxqfdRlHAUj6L2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 2, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "Tdv8C8b6Q5ZJTEDxqfdRlHAUj6L2",
            "__collections__": {}
          },
          "rodVV0ACwjszWWudyxTF": {
            "groupId": "eBaR4JUBAaMe2isz4tAs",
            "id": "rodVV0ACwjszWWudyxTF",
            "playerOneId": "g3n98fHe82f26hXfXIxFg9Wuv9k1",
            "playerTwoId": "bSP0oL0zRPZnwLrPTWD1qR6uQzv1",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 2, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "bSP0oL0zRPZnwLrPTWD1qR6uQzv1",
            "__collections__": {}
          },
          "tYTyMGLc5IXn31VKI2kT": {
            "groupId": "eBaR4JUBAaMe2isz4tAs",
            "id": "tYTyMGLc5IXn31VKI2kT",
            "playerOneId": "0QeiGLftDWSGhb3rye4lO7Gmvsr2",
            "playerTwoId": "bSP0oL0zRPZnwLrPTWD1qR6uQzv1",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 2, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 1, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "bSP0oL0zRPZnwLrPTWD1qR6uQzv1",
            "__collections__": {}
          },
          "yvdclVMq1j6s7yfer4Lz": {
            "groupId": "eBaR4JUBAaMe2isz4tAs",
            "id": "yvdclVMq1j6s7yfer4Lz",
            "playerOneId": "0QeiGLftDWSGhb3rye4lO7Gmvsr2",
            "playerTwoId": "g3n98fHe82f26hXfXIxFg9Wuv9k1",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 7, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 7, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "0QeiGLftDWSGhb3rye4lO7Gmvsr2",
            "__collections__": {}
          }
        }
      }
    },
    "hkl4G8DDP69AmmekCPhF": {
      "color": "#1976d2",
      "createdAt": { "__time__": "2025-08-23T12:29:00.419Z" },
      "memberIds": [
        "0YAJLuHDB5VP66rd3D2zWDOmMUA3",
        "dBYcjePClXUYZHAMbCVbtoH7dSL2",
        "Te3EsR4ladMEnOkR65CIQ6X2Oah2",
        "jzbWUnrsEqNKXJ6rEVTuSXrlDLo2"
      ],
      "members": [
        { "id": "0YAJLuHDB5VP66rd3D2zWDOmMUA3" },
        { "id": "dBYcjePClXUYZHAMbCVbtoH7dSL2" },
        { "id": "Te3EsR4ladMEnOkR65CIQ6X2Oah2" },
        { "id": "jzbWUnrsEqNKXJ6rEVTuSXrlDLo2" }
      ],
      "name": "Skupina 1",
      "__collections__": {
        "matches": {
          "4D3TFw4VOleVYmmQ6gw3": {
            "groupId": "hkl4G8DDP69AmmekCPhF",
            "id": "4D3TFw4VOleVYmmQ6gw3",
            "playerOneId": "dBYcjePClXUYZHAMbCVbtoH7dSL2",
            "playerTwoId": "jzbWUnrsEqNKXJ6rEVTuSXrlDLo2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 1, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 4, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "jzbWUnrsEqNKXJ6rEVTuSXrlDLo2",
            "__collections__": {}
          },
          "5NgwkgFDdsYhhBHpH8rN": {
            "groupId": "hkl4G8DDP69AmmekCPhF",
            "playerOneId": "0YAJLuHDB5VP66rd3D2zWDOmMUA3",
            "playerTwoId": "dBYcjePClXUYZHAMbCVbtoH7dSL2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "IP6fQsIyBYhf02qMHTkF": {
            "groupId": "hkl4G8DDP69AmmekCPhF",
            "id": "IP6fQsIyBYhf02qMHTkF",
            "playerOneId": "dBYcjePClXUYZHAMbCVbtoH7dSL2",
            "playerTwoId": "Te3EsR4ladMEnOkR65CIQ6X2Oah2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 3, "setNumber": 1 },
              { "playerOneGames": 7, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "dBYcjePClXUYZHAMbCVbtoH7dSL2",
            "__collections__": {}
          },
          "UfAyGaMdzkhTyGlBf6Pa": {
            "groupId": "hkl4G8DDP69AmmekCPhF",
            "playerOneId": "Te3EsR4ladMEnOkR65CIQ6X2Oah2",
            "playerTwoId": "jzbWUnrsEqNKXJ6rEVTuSXrlDLo2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "aObGWQ1TQLoMU3VJZK9t": {
            "groupId": "hkl4G8DDP69AmmekCPhF",
            "id": "aObGWQ1TQLoMU3VJZK9t",
            "playerOneId": "0YAJLuHDB5VP66rd3D2zWDOmMUA3",
            "playerTwoId": "jzbWUnrsEqNKXJ6rEVTuSXrlDLo2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 5, "playerTwoGames": 7, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 3, "setNumber": 2 },
              { "playerOneGames": 10, "playerTwoGames": 8, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "0YAJLuHDB5VP66rd3D2zWDOmMUA3",
            "__collections__": {}
          },
          "yqcKhedq8vGnjGLAJHjn": {
            "groupId": "hkl4G8DDP69AmmekCPhF",
            "id": "yqcKhedq8vGnjGLAJHjn",
            "playerOneId": "0YAJLuHDB5VP66rd3D2zWDOmMUA3",
            "playerTwoId": "Te3EsR4ladMEnOkR65CIQ6X2Oah2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 1, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 3, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "0YAJLuHDB5VP66rd3D2zWDOmMUA3",
            "__collections__": {}
          }
        }
      }
    },
    "igprOAZsU9mJhwa55jKz": {
      "color": "#1565c0",
      "createdAt": { "__time__": "2025-08-23T12:31:48.915Z" },
      "memberIds": [
        "NXLnCygXELOrLExtDDL9xsqqHxs2",
        "PackjJmJO1PPIAumxoZR0xV0iKk2",
        "jez4lbWbtMcFzHaaC4lZqX0dgEz1",
        "zeyEuOP4Nbhs20UORQhzVzfC1hd2"
      ],
      "members": [
        { "id": "NXLnCygXELOrLExtDDL9xsqqHxs2" },
        { "id": "PackjJmJO1PPIAumxoZR0xV0iKk2" },
        { "id": "jez4lbWbtMcFzHaaC4lZqX0dgEz1" },
        { "id": "zeyEuOP4Nbhs20UORQhzVzfC1hd2" }
      ],
      "name": "Skupina 8",
      "__collections__": {
        "matches": {
          "EFbF4zzmu55y15AqebwK": {
            "groupId": "igprOAZsU9mJhwa55jKz",
            "id": "EFbF4zzmu55y15AqebwK",
            "playerOneId": "jez4lbWbtMcFzHaaC4lZqX0dgEz1",
            "playerTwoId": "zeyEuOP4Nbhs20UORQhzVzfC1hd2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 2, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 2, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "jez4lbWbtMcFzHaaC4lZqX0dgEz1",
            "__collections__": {}
          },
          "FVEqlOHPI5lWK0HB3qHl": {
            "groupId": "igprOAZsU9mJhwa55jKz",
            "id": "FVEqlOHPI5lWK0HB3qHl",
            "playerOneId": "NXLnCygXELOrLExtDDL9xsqqHxs2",
            "playerTwoId": "PackjJmJO1PPIAumxoZR0xV0iKk2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 3, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 1, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "NXLnCygXELOrLExtDDL9xsqqHxs2",
            "__collections__": {}
          },
          "PxbzWiAiV4sI4G31OWk3": {
            "groupId": "igprOAZsU9mJhwa55jKz",
            "playerOneId": "PackjJmJO1PPIAumxoZR0xV0iKk2",
            "playerTwoId": "zeyEuOP4Nbhs20UORQhzVzfC1hd2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Čeka",
            "winnerId": "",
            "__collections__": {}
          },
          "iHARBtUv6O6Foqloo3Gf": {
            "groupId": "igprOAZsU9mJhwa55jKz",
            "id": "iHARBtUv6O6Foqloo3Gf",
            "playerOneId": "PackjJmJO1PPIAumxoZR0xV0iKk2",
            "playerTwoId": "jez4lbWbtMcFzHaaC4lZqX0dgEz1",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 2, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 0, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "jez4lbWbtMcFzHaaC4lZqX0dgEz1",
            "__collections__": {}
          },
          "jNlDzaFONdyrgrU9JcA6": {
            "groupId": "igprOAZsU9mJhwa55jKz",
            "id": "jNlDzaFONdyrgrU9JcA6",
            "playerOneId": "NXLnCygXELOrLExtDDL9xsqqHxs2",
            "playerTwoId": "zeyEuOP4Nbhs20UORQhzVzfC1hd2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 1, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "NXLnCygXELOrLExtDDL9xsqqHxs2",
            "__collections__": {}
          },
          "sQicweE7aCbL7RYp66qI": {
            "groupId": "igprOAZsU9mJhwa55jKz",
            "id": "sQicweE7aCbL7RYp66qI",
            "playerOneId": "NXLnCygXELOrLExtDDL9xsqqHxs2",
            "playerTwoId": "jez4lbWbtMcFzHaaC4lZqX0dgEz1",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 1, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 2, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "jez4lbWbtMcFzHaaC4lZqX0dgEz1",
            "__collections__": {}
          }
        }
      }
    },
    "zJtLeqErZUwPTIst6EcP": {
      "color": "#9c27b0",
      "createdAt": { "__time__": "2025-08-23T12:29:35.823Z" },
      "memberIds": [
        "NdDjMc2IrcbKWOAh8hj3ysvIduD3",
        "RlOpTqaqVvUbmIx6biljzpmsfM23",
        "k71IlIxZjNU9IYmoK7WgJPe8WcW2",
        "61ySx2tIK2aDMS5CnCCpc1exwou2"
      ],
      "members": [
        { "id": "NdDjMc2IrcbKWOAh8hj3ysvIduD3" },
        { "id": "RlOpTqaqVvUbmIx6biljzpmsfM23" },
        { "id": "k71IlIxZjNU9IYmoK7WgJPe8WcW2" },
        { "id": "61ySx2tIK2aDMS5CnCCpc1exwou2" }
      ],
      "name": "Skupina 3",
      "__collections__": {
        "matches": {
          "98qtJBwAz6UwA38zCd0Y": {
            "groupId": "zJtLeqErZUwPTIst6EcP",
            "id": "98qtJBwAz6UwA38zCd0Y",
            "playerOneId": "NdDjMc2IrcbKWOAh8hj3ysvIduD3",
            "playerTwoId": "RlOpTqaqVvUbmIx6biljzpmsfM23",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 3, "playerTwoGames": 6, "setNumber": 1 },
              { "playerOneGames": 3, "playerTwoGames": 6, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "RlOpTqaqVvUbmIx6biljzpmsfM23",
            "__collections__": {}
          },
          "QnSHwXasgncmvZDkmr62": {
            "groupId": "zJtLeqErZUwPTIst6EcP",
            "id": "QnSHwXasgncmvZDkmr62",
            "playerOneId": "k71IlIxZjNU9IYmoK7WgJPe8WcW2",
            "playerTwoId": "61ySx2tIK2aDMS5CnCCpc1exwou2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 3, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 1, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "k71IlIxZjNU9IYmoK7WgJPe8WcW2",
            "__collections__": {}
          },
          "T0WqBnW8ti4MrryCad1O": {
            "groupId": "zJtLeqErZUwPTIst6EcP",
            "id": "T0WqBnW8ti4MrryCad1O",
            "playerOneId": "NdDjMc2IrcbKWOAh8hj3ysvIduD3",
            "playerTwoId": "61ySx2tIK2aDMS5CnCCpc1exwou2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "NdDjMc2IrcbKWOAh8hj3ysvIduD3",
            "__collections__": {}
          },
          "g9iaufsHh2nSwmMaZnLR": {
            "groupId": "zJtLeqErZUwPTIst6EcP",
            "id": "g9iaufsHh2nSwmMaZnLR",
            "playerOneId": "NdDjMc2IrcbKWOAh8hj3ysvIduD3",
            "playerTwoId": "k71IlIxZjNU9IYmoK7WgJPe8WcW2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 2, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "NdDjMc2IrcbKWOAh8hj3ysvIduD3",
            "__collections__": {}
          },
          "ibQOCadBzwAkP2j1RDa3": {
            "groupId": "zJtLeqErZUwPTIst6EcP",
            "id": "ibQOCadBzwAkP2j1RDa3",
            "playerOneId": "RlOpTqaqVvUbmIx6biljzpmsfM23",
            "playerTwoId": "61ySx2tIK2aDMS5CnCCpc1exwou2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 1, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 0, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "RlOpTqaqVvUbmIx6biljzpmsfM23",
            "__collections__": {}
          },
          "kzwg6hI6CpNK4XIWhgnx": {
            "groupId": "zJtLeqErZUwPTIst6EcP",
            "id": "kzwg6hI6CpNK4XIWhgnx",
            "playerOneId": "RlOpTqaqVvUbmIx6biljzpmsfM23",
            "playerTwoId": "k71IlIxZjNU9IYmoK7WgJPe8WcW2",
            "scheduledAt": null,
            "sets": [
              { "playerOneGames": 6, "playerTwoGames": 0, "setNumber": 1 },
              { "playerOneGames": 6, "playerTwoGames": 1, "setNumber": 2 },
              { "playerOneGames": 0, "playerTwoGames": 0, "setNumber": 3 }
            ],
            "status": "Završen",
            "winnerId": "RlOpTqaqVvUbmIx6biljzpmsfM23",
            "__collections__": {}
          }
        }
      }
    }
  }
}
'::jsonb
),
users_firebase_json (j) AS (
    SELECT '{
  "meta": {
    "format": "JSON",
    "version": "1.1.0",
    "projectId": "dgte-liga",
    "resourcePath": ["users"],
    "recursive": false,
    "creationTime": 1759152567,
    "app": "firefoo"
  },
  "data": {
    "0QeiGLftDWSGhb3rye4lO7Gmvsr2": {
      "email": "markobošković@markobošković.com",
      "firstName": "Marko",
      "lastName": "Bošković",
      "phone": "+385997860126",
      "__collections__": {}
    },
    "0YAJLuHDB5VP66rd3D2zWDOmMUA3": {
      "email": "igormijatov@igormijatov.com",
      "firstName": "Igor",
      "lastName": "Mijatov",
      "phone": "+38598329984",
      "__collections__": {}
    },
    "61ySx2tIK2aDMS5CnCCpc1exwou2": {
      "email": "filipčevizović@filipčevizović.com",
      "firstName": "Filip",
      "lastName": "Čevizović",
      "phone": "+385989784916",
      "__collections__": {}
    },
    "8VZYwhTifqg6C4JDuFjcMLjNxp62": {
      "email": "vedrancerina@vedrancerina.com",
      "firstName": "Vedran",
      "lastName": "Cerina",
      "phone": "+385959156546",
      "__collections__": {}
    },
    "9cMJ5qlhovaSAjA1Rdp1wUdqrBJ2": {
      "email": "patricknikić@patricknikić.com",
      "firstName": "Patrick",
      "lastName": "Nikić",
      "phone": "+385997728631",
      "__collections__": {}
    },
    "Bgiv8elIYNaQV16gmNlQDWPl4vj1": {
      "email": "davorgrgić@davorgrgić.com",
      "firstName": "Davor",
      "isAdmin": true,
      "lastName": "Grgić",
      "phone": "+385913454557",
      "__collections__": {}
    },
    "KgwTrqmSqROmSkWfc7FePW3hOjm1": {
      "email": "markojović@markojović.com",
      "firstName": "Marko",
      "lastName": "Jović",
      "phone": "+385989003751",
      "__collections__": {}
    },
    "NXLnCygXELOrLExtDDL9xsqqHxs2": {
      "email": "marioštrok@marioštrok.com",
      "firstName": "Mario",
      "lastName": "Štrok",
      "phone": "+385989767070",
      "__collections__": {}
    },
    "NdDjMc2IrcbKWOAh8hj3ysvIduD3": {
      "email": "mariojerković@mariojerković.com",
      "firstName": "Mario",
      "lastName": "Jerković",
      "phone": "+385992374324",
      "__collections__": {}
    },
    "PackjJmJO1PPIAumxoZR0xV0iKk2": {
      "email": "ivanžupan@ivanžupan.com",
      "firstName": "Ivan",
      "lastName": "Župan",
      "phone": "+385955320245",
      "__collections__": {}
    },
    "RlOpTqaqVvUbmIx6biljzpmsfM23": {
      "email": "ivanlazić@ivanlazić.com",
      "firstName": "Ivan",
      "lastName": "Lazić",
      "phone": "+385992616800",
      "__collections__": {}
    },
    "Tdv8C8b6Q5ZJTEDxqfdRlHAUj6L2": {
      "email": "domagojroguljić@domagojroguljić.com",
      "firstName": "Domagoj",
      "id": "Tdv8C8b6Q5ZJTEDxqfdRlHAUj6L2",
      "lastName": "Roguljić",
      "phone": "+385917929744",
      "__collections__": {}
    },
    "Te3EsR4ladMEnOkR65CIQ6X2Oah2": {
      "email": "hrvojegrubeša@hrvojegrubeša.com",
      "firstName": "Dario",
      "id": "Te3EsR4ladMEnOkR65CIQ6X2Oah2",
      "lastName": "Jagarinec",
      "phone": "+38598223333",
      "__collections__": {}
    },
    "WMuGrVVIJfYb8rdj4GxLIvh8kBh2": {
      "email": "nenadcvijetić@nenadcvijetić.com",
      "firstName": "Ivan",
      "id": "WMuGrVVIJfYb8rdj4GxLIvh8kBh2",
      "lastName": "Ambreuš",
      "phone": "+385958186967",
      "__collections__": {}
    },
    "XHKuOIhDiRYIu1zFUbMdNXNECPG3": {
      "email": "robertšvab@robertšvab.com",
      "firstName": "Robert",
      "lastName": "Švab",
      "phone": "+385916400219",
      "__collections__": {}
    },
    "XgqxD2zw15gI8fROqj6xPQ1b2ux1": {
      "email": "angeladiroma@angeladiroma.com",
      "firstName": "Angela",
      "lastName": "Di Roma",
      "phone": "+491735133688",
      "__collections__": {}
    },
    "YOrrIrvpooVWCRWX9gzs5EjLCD43": {
      "email": "matkovicić@matkovicić.com",
      "firstName": "Matko",
      "lastName": "Vicić",
      "phone": "+385913093065",
      "__collections__": {}
    },
    "bNCsSiOW0teYIFRuxXC4SELij3Z2": {
      "email": "dinkopleša@dinkopleša.com",
      "firstName": "Dinko",
      "lastName": "Pleša",
      "phone": "+385915661258",
      "__collections__": {}
    },
    "bSP0oL0zRPZnwLrPTWD1qR6uQzv1": {
      "email": "željkobilić@željkobilić.com",
      "firstName": "Željko",
      "lastName": "Bilić",
      "phone": "+38598315979",
      "__collections__": {}
    },
    "ciuWwLPeorZ69cbXfDWvTTICM6P2": {
      "email": "danijeljakovac@danijeljakovac.com",
      "firstName": "Danijel",
      "lastName": "Jakovac",
      "phone": "+385953533072",
      "__collections__": {}
    },
    "dBYcjePClXUYZHAMbCVbtoH7dSL2": {
      "email": "tihomiršimunić@tihomiršimunić.com",
      "firstName": "Tihomir",
      "lastName": "Šimunić",
      "phone": "+385916223202",
      "__collections__": {}
    },
    "g3n98fHe82f26hXfXIxFg9Wuv9k1": {
      "email": "ivanvrebac@ivanvrebac.com",
      "firstName": "Antun",
      "id": "g3n98fHe82f26hXfXIxFg9Wuv9k1",
      "lastName": "Marošević",
      "phone": "+385916191737",
      "__collections__": {}
    },
    "jez4lbWbtMcFzHaaC4lZqX0dgEz1": {
      "email": "brunojagarinec@brunojagarinec.com",
      "firstName": "Bruno",
      "lastName": "Jagarinec",
      "phone": "+385915775732",
      "__collections__": {}
    },
    "jzbWUnrsEqNKXJ6rEVTuSXrlDLo2": {
      "email": "damjansimonović@damjansimonović.com",
      "firstName": "Damjan",
      "lastName": "Simonović",
      "phone": "+385994876499",
      "__collections__": {}
    },
    "k71IlIxZjNU9IYmoK7WgJPe8WcW2": {
      "email": "matejtolj@matejtolj.com",
      "firstName": "Matej",
      "lastName": "Tolj",
      "phone": "+385951977137",
      "__collections__": {}
    },
    "laSQqPrCOGNQAkwhIigNsNdAG4D2": {
      "email": "vickomustapić@vickomustapić.com",
      "firstName": "Vicko",
      "lastName": "Mustapić",
      "phone": "+38598825180",
      "__collections__": {}
    },
    "oqANEgkBfob6l0pocroQMTdbR5r1": {
      "email": "ivantolić@ivantolić.com",
      "firstName": "Ivan",
      "lastName": "Tolić",
      "phone": "+385989130323",
      "__collections__": {}
    },
    "pqpZKupNWVgPsXeqm7cNm9KX69G3": {
      "email": "ivankožul@ivankožul.com",
      "firstName": "Ivan",
      "lastName": "Kožul",
      "phone": "+385989615495",
      "__collections__": {}
    },
    "qjoXNj7h3XMaqshxiRDuH3KJsxG3": {
      "email": "antunrukavina@antunrukavina.com",
      "firstName": "Antun",
      "lastName": "Rukavina",
      "phone": "+385997804794",
      "__collections__": {}
    },
    "uQU4tEsYEeSdt6n2xHLXZkngrex1": {
      "email": "krešimirlončarević@krešimirlončarević.com",
      "firstName": "Krešimir",
      "lastName": "Lončarević",
      "phone": "+385993234994",
      "__collections__": {}
    },
    "wWP3cINFXSRptkwXPsL394GTS1q1": {
      "email": "slavkonedić@slavkonedić.com",
      "firstName": "Boris",
      "id": "wWP3cINFXSRptkwXPsL394GTS1q1",
      "lastName": "Tanasić",
      "phone": "+385989569695",
      "__collections__": {}
    },
    "wfqmXUC9htZkEyUOo3s5K8d0w9G2": {
      "email": "domagojvidaković@domagojvidaković.com",
      "firstName": "Domagoj",
      "lastName": "Vidaković",
      "phone": "+385955664412",
      "__collections__": {}
    },
    "zeyEuOP4Nbhs20UORQhzVzfC1hd2": {
      "email": "draženmedvedec@draženmedvedec.com",
      "firstName": "Ivan",
      "id": "zeyEuOP4Nbhs20UORQhzVzfC1hd2",
      "lastName": "Zubac",
      "phone": "+385915858646",
      "__collections__": {}
    }
  }
}
'::jsonb
),
users_supabase_json (j) AS (
    SELECT '[
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "ac1e982b-2297-4039-897c-6de0da2b9fd4",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "ivan.kozul@ivan.kozul.com",
    "encrypted_password": "$2a$10$SOLP8XxpNLU2u84I3yud3upzTsAbCCuXuhBw6m9HC6GZBleoPLx2y",
    "email_confirmed_at": "2025-10-01 09:32:29.152172+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:32:29.155404+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "ac1e982b-2297-4039-897c-6de0da2b9fd4",
      "email": "ivan.kozul@ivan.kozul.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:32:29.1471+00",
    "updated_at": "2025-10-01 09:32:29.158687+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:32:29.152172+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "31af73d2-dbfc-4319-ba59-f2edf55b5523",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "bruno.jagarinec@bruno.jagarinec.com",
    "encrypted_password": "$2a$10$xBXTU2zVtb6qtS/NqP2BNObGakAkQSfx1P0Z/rFojvloL6ryj5XKm",
    "email_confirmed_at": "2025-10-01 09:31:48.269889+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:31:48.273022+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "31af73d2-dbfc-4319-ba59-f2edf55b5523",
      "email": "bruno.jagarinec@bruno.jagarinec.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:31:48.264876+00",
    "updated_at": "2025-10-01 09:31:48.274964+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:31:48.269889+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "b6189de7-d6c5-4a1f-b30d-cd57127f191b",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "angela.diroma@angela.diroma.com",
    "encrypted_password": "$2a$10$JdTwoMs0SBW6vqM7DU2QL..6Rsmk5JxMTkbkPe7Pg2nE2QqWJQRHu",
    "email_confirmed_at": "2025-10-01 09:31:16.633695+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:31:16.637867+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "b6189de7-d6c5-4a1f-b30d-cd57127f191b",
      "email": "angela.diroma@angela.diroma.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:31:16.622768+00",
    "updated_at": "2025-10-01 09:31:16.639914+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:31:16.633695+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "ef4b0c57-5504-40f9-91d9-ed37618d855d",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "vicko.mustapic@vicko.mustapic.com",
    "encrypted_password": "$2a$10$psLePvB1Fb9Lo7whKnCdIuMr9o8Ta65N2oL17Ymkb3tcC1FVyDWO.",
    "email_confirmed_at": "2025-10-01 09:33:39.354979+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:33:39.358828+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "ef4b0c57-5504-40f9-91d9-ed37618d855d",
      "email": "vicko.mustapic@vicko.mustapic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:33:39.348382+00",
    "updated_at": "2025-10-01 09:33:39.361922+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:33:39.354979+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "27934f12-10b3-4f5f-af7c-77a2596b4d21",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "marko.jovic@marko.jovic.com",
    "encrypted_password": "$2a$10$a1HCfCJSdDaVoT9UkC9LUuI8lfxpYRyP3ECK6iqm2pvntQEtKaJAy",
    "email_confirmed_at": "2025-10-01 09:32:15.675032+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:32:15.678555+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "27934f12-10b3-4f5f-af7c-77a2596b4d21",
      "email": "marko.jovic@marko.jovic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:32:15.668943+00",
    "updated_at": "2025-10-01 09:32:15.680311+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:32:15.675032+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "445f49b2-da17-49e2-ae18-6d022511a662",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "dario.jagarinec@dario.jagarinec.com",
    "encrypted_password": "$2a$10$j5KcE.RKgVfjLWSp1dOk3Okr1sMn1UsZfcThIxioDZwxj.jQr2Xuu",
    "email_confirmed_at": "2025-10-01 09:31:34.710327+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:31:34.713664+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "445f49b2-da17-49e2-ae18-6d022511a662",
      "email": "dario.jagarinec@dario.jagarinec.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:31:34.705186+00",
    "updated_at": "2025-10-01 09:31:34.715378+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:31:34.710327+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "0067463b-e1ce-418b-9527-f0f4f73bbd46",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "kresimir.loncarevic@kresimir.loncarevic.com",
    "encrypted_password": "$2a$10$O6jdAYIPCMPCIS/Yfh0UAei2GmrHCM08/kOA1tdDM8ZPxK4yiJUCK",
    "email_confirmed_at": "2025-10-01 09:32:57.546726+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:32:57.55174+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "0067463b-e1ce-418b-9527-f0f4f73bbd46",
      "email": "kresimir.loncarevic@kresimir.loncarevic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:32:57.539851+00",
    "updated_at": "2025-10-01 09:32:57.553472+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:32:57.546726+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "533b24a2-8771-493f-820e-d2d87fb1b9d2",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "mario.jerkovic@mario.jerkovic.com",
    "encrypted_password": "$2a$10$r/cwIyiiKhWIi58TPQc1cO89Pp3WjO5MCqoJtNDsOTIgYC3m204re",
    "email_confirmed_at": "2025-10-01 09:32:01.958118+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:32:01.961411+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "533b24a2-8771-493f-820e-d2d87fb1b9d2",
      "email": "mario.jerkovic@mario.jerkovic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:32:01.952096+00",
    "updated_at": "2025-10-01 09:32:01.963542+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:32:01.958118+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "ee94cb85-705f-4737-ac51-77af409bc9f5",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "ivan.lazic@ivan.lazic.com",
    "encrypted_password": "$2a$10$jL1oxHchNTAdAFJlBvwZyO6srdk8hxBrFzOUG/nOek7eSYN8PY.Ta",
    "email_confirmed_at": "2025-10-01 09:32:43.649731+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:32:43.653119+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "ee94cb85-705f-4737-ac51-77af409bc9f5",
      "email": "ivan.lazic@ivan.lazic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:32:43.644269+00",
    "updated_at": "2025-10-01 09:32:43.654809+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:32:43.649731+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "4b6adf91-50ac-4a42-ab1a-96c565b002c9",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "patrick.nikic@patrick.nikic.com",
    "encrypted_password": "$2a$10$8.oeoxm8OSU2qh9yxFespOr9.aG4kwmW5Ye/XcfGHZVBlYOj4ON76",
    "email_confirmed_at": "2025-10-01 09:33:50.000546+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:33:50.010368+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "4b6adf91-50ac-4a42-ab1a-96c565b002c9",
      "email": "patrick.nikic@patrick.nikic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:33:49.994286+00",
    "updated_at": "2025-10-01 09:33:50.013487+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:33:50.000546+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "c5ceb8bc-49f0-4c89-957e-b3b0069329d3",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "antun.marosevic@antun.marosevic.com",
    "encrypted_password": "$2a$10$d8r/ihlqsk9Ik4nVI6l10OtTi0cBk8BsxeDBFpks/sF0n498FMHJS",
    "email_confirmed_at": "2025-10-01 09:33:07.284399+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:33:07.288536+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "c5ceb8bc-49f0-4c89-957e-b3b0069329d3",
      "email": "antun.marosevic@antun.marosevic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:33:07.278927+00",
    "updated_at": "2025-10-01 09:33:07.290277+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:33:07.284399+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "6aae8118-b5a8-471e-98cd-4ef7eece1aa5",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "igor.mijatov@igor.mijatov.com",
    "encrypted_password": "$2a$10$/vETB5YqeHMfrieSRnH1yunAWnIjnPZcXTYAh7SrJvNlZSISGhUXa",
    "email_confirmed_at": "2025-10-01 09:33:24.786914+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:33:24.790311+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "6aae8118-b5a8-471e-98cd-4ef7eece1aa5",
      "email": "igor.mijatov@igor.mijatov.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:33:24.780482+00",
    "updated_at": "2025-10-01 09:33:24.79187+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:33:24.786914+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "2d658723-13b0-4ca1-b1a6-b2e07aaa3248",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "ivan.zubac@ivan.zubac.com",
    "encrypted_password": "$2a$10$Fpe8xq6zeYYquzWXdSRN8O/PDKBbmD1rF3jr1/36yXBGM0X55hCCW",
    "email_confirmed_at": "2025-10-01 09:36:13.590807+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:36:13.598193+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "2d658723-13b0-4ca1-b1a6-b2e07aaa3248",
      "email": "ivan.zubac@ivan.zubac.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:36:13.58439+00",
    "updated_at": "2025-10-01 09:36:13.599901+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:36:13.590807+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "e36dcf70-b7eb-471e-a940-de753fd38509",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "danijel.jakovac@danijel.jakovac.com",
    "encrypted_password": "$2a$10$noDR8b7BqJCyi3Xr4ttgiuskTWTesj3bY45vMiiu5Sp53JCw7HmdS",
    "email_confirmed_at": "2025-09-30 19:53:16.405838+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:39:02.462231+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "e36dcf70-b7eb-471e-a940-de753fd38509",
      "email": "danijel.jakovac@danijel.jakovac.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-09-30 19:53:16.393908+00",
    "updated_at": "2025-10-01 09:39:02.464743+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-09-30 19:53:16.405838+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "00d9627e-5690-45e5-bef9-b04d764f1f9c",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "antun.rukavina@antun.rukavina.com",
    "encrypted_password": "$2a$10$ADUuruWTcle4sudfT1cDGeMhHH6vOCdWKw9CoHvzw/KDHgfkU/Ar6",
    "email_confirmed_at": "2025-10-01 09:34:35.364373+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:34:35.367895+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "00d9627e-5690-45e5-bef9-b04d764f1f9c",
      "email": "antun.rukavina@antun.rukavina.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:34:35.355522+00",
    "updated_at": "2025-10-01 09:34:35.369685+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:34:35.364373+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "745d27b5-e7da-4edf-a8c2-96eb943db292",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "zeljko.bilic@zeljko.bilic.com",
    "encrypted_password": "$2a$10$hPiBBBCchicU3TemmgKvEeQh65nBhez./t.x7NfSqIZ1aQF8.dlzu",
    "email_confirmed_at": "2025-10-01 09:30:19.518931+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:30:19.524022+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "745d27b5-e7da-4edf-a8c2-96eb943db292",
      "email": "zeljko.bilic@zeljko.bilic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:30:19.511319+00",
    "updated_at": "2025-10-01 09:30:19.526681+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:30:19.518931+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "0e8312b7-9fee-40f6-9e16-7c945a3225ba",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "vedran.cerina@vedran.cerina.com",
    "encrypted_password": "$2a$10$x/bLB8acfhdLo4uVtRipvuP24S302z9us.UzsgAPwgwuQcoHUUBAi",
    "email_confirmed_at": "2025-10-01 09:30:48.310624+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:30:48.314079+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "0e8312b7-9fee-40f6-9e16-7c945a3225ba",
      "email": "vedran.cerina@vedran.cerina.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:30:48.303769+00",
    "updated_at": "2025-10-01 09:30:48.315914+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:30:48.310624+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "4c160cd9-aa07-4bf9-8497-dafabd50f552",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "matko.vicic@matko.vicic.com",
    "encrypted_password": "$2a$10$sO6sCGSbTKDPz.GoNXbIe.mLMUEdCBBmlnP7eFFvCJQzsNQ58N6hK",
    "email_confirmed_at": "2025-10-01 09:35:50.671994+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:35:50.676114+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "4c160cd9-aa07-4bf9-8497-dafabd50f552",
      "email": "matko.vicic@matko.vicic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:35:50.665494+00",
    "updated_at": "2025-10-01 09:35:50.679056+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:35:50.671994+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "469bfe2f-7758-48bb-b3aa-660dbaffce66",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "domagoj.roguljic@domagoj.roguljic.com",
    "encrypted_password": "$2a$10$6gbntQa1VUI7xmiY0TVe6etgmRoEdecyXReZCR3aiOM1IEAPF0YSm",
    "email_confirmed_at": "2025-10-01 09:34:20.148742+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:34:20.15203+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "469bfe2f-7758-48bb-b3aa-660dbaffce66",
      "email": "domagoj.roguljic@domagoj.roguljic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:34:20.140556+00",
    "updated_at": "2025-10-01 09:34:20.153754+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:34:20.148742+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "7436072c-b10d-4307-8443-7d51616a2051",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "ivan.ambreus@ivan.ambreus.com",
    "encrypted_password": "$2a$10$Rx8DSQ.f3KId7DOqZX0Ys.AdmixcXY2kojXzxdONg6S0WBj2cCsYu",
    "email_confirmed_at": "2025-10-01 09:29:15.971296+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:29:15.974992+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "7436072c-b10d-4307-8443-7d51616a2051",
      "email": "ivan.ambreus@ivan.ambreus.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:29:15.963957+00",
    "updated_at": "2025-10-01 09:29:15.977248+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:29:15.971296+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "5db6d6b3-342a-4afb-a443-f63425e7dfd4",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "marko.boskovic@marko.boskovic.com",
    "encrypted_password": "$2a$10$wYCScbh2nv.9y.E9oKpiD.Guv3JCEURHrv9FylsA3lE9.8EZ0in5K",
    "email_confirmed_at": "2025-10-01 09:30:34.298265+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:30:34.301644+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "5db6d6b3-342a-4afb-a443-f63425e7dfd4",
      "email": "marko.boskovic@marko.boskovic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:30:34.292688+00",
    "updated_at": "2025-10-01 09:30:34.303412+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:30:34.298265+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "0c49078b-3487-49ed-9524-2ab8119f3719",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "boris.tanasic@boris.tanasic.com",
    "encrypted_password": "$2a$10$CV.5uZ2Fy4Ue5HK4ZaRnne2JGxj4qh23iKfEUAs0dFmn2LUdXOxqy",
    "email_confirmed_at": "2025-10-01 09:35:01.535041+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:35:01.547295+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "0c49078b-3487-49ed-9524-2ab8119f3719",
      "email": "boris.tanasic@boris.tanasic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:35:01.439018+00",
    "updated_at": "2025-10-01 09:35:01.554682+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:35:01.535041+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "c63a034a-e013-4ae8-b12d-dc42bb37f4d9",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "dinko.plesa@dinko.plesa.com",
    "encrypted_password": "$2a$10$l59E8vxb0LPBYq95v3TOqeaf3B7Wf9PYqqhOb1KItfo/lwVuqxcKK",
    "email_confirmed_at": "2025-10-01 09:34:05.247814+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:34:05.251275+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "c63a034a-e013-4ae8-b12d-dc42bb37f4d9",
      "email": "dinko.plesa@dinko.plesa.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:34:05.241469+00",
    "updated_at": "2025-10-01 09:34:05.253159+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:34:05.247814+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "95439086-4b8a-485b-8d40-c2783327667b",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "damjan.simonovic@damjan.simonovic.com",
    "encrypted_password": "$2a$10$4bEgHpj9xy2EdrLWnhhttOTN.G8ev6izd9l8CfldRo/08i2NsMyfi",
    "email_confirmed_at": "2025-10-01 09:34:50.064736+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:34:50.093487+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "95439086-4b8a-485b-8d40-c2783327667b",
      "email": "damjan.simonovic@damjan.simonovic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:34:49.924383+00",
    "updated_at": "2025-10-01 09:34:50.117114+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:34:50.064736+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "0310084b-13ed-4f00-abf3-148cc3f011df",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "domagoj.vidakovic@domagoj.vidakovic.com",
    "encrypted_password": "$2a$10$i/H7GiZlP8jfv5ZkIglC/OvQi4hz5zhMB8AC5UQMRDVhiXuBxkWNG",
    "email_confirmed_at": "2025-10-01 09:36:00.650453+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:36:00.655621+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "0310084b-13ed-4f00-abf3-148cc3f011df",
      "email": "domagoj.vidakovic@domagoj.vidakovic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:36:00.625919+00",
    "updated_at": "2025-10-01 09:36:00.657343+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:36:00.650453+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "0c78630d-d3c3-4734-88c5-05fe8a947683",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "ivan.tolic@ivan.tolic.com",
    "encrypted_password": "$2a$10$uPNi1HzUA8BGyJDQ1KlJ9ugZApcSdZnpzDfWQGs6w83VK9qrRVD9S",
    "email_confirmed_at": "2025-10-01 09:35:16.642664+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:35:16.648685+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "0c78630d-d3c3-4734-88c5-05fe8a947683",
      "email": "ivan.tolic@ivan.tolic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:35:16.62458+00",
    "updated_at": "2025-10-01 09:35:16.65245+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:35:16.642664+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "1f961ec0-4d3b-4910-b9fb-6f775d140833",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "matej.tolj@matej.tolj.com",
    "encrypted_password": "$2a$10$R9xdJSQp6a/X1SkzC9/UUep2B7IBbsO/Kzc3dPkC26SNO/mpKj/Vu",
    "email_confirmed_at": "2025-10-01 09:35:36.649721+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:35:36.657637+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "1f961ec0-4d3b-4910-b9fb-6f775d140833",
      "email": "matej.tolj@matej.tolj.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:35:36.636638+00",
    "updated_at": "2025-10-01 09:35:36.664751+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:35:36.649721+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "67e456f5-95b0-4336-80ed-7606091cc476",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "filip.cevizovic@filip.cevizovic.com",
    "encrypted_password": "$2a$10$j9uRrSVXt2aKlF.4undaGuk.p7zl6uJvRQXFYkWnHpDigSe7JhEcy",
    "email_confirmed_at": "2025-10-01 09:36:25.515264+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:36:25.521379+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "67e456f5-95b0-4336-80ed-7606091cc476",
      "email": "filip.cevizovic@filip.cevizovic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:36:25.509225+00",
    "updated_at": "2025-10-01 09:36:25.522969+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:36:25.515264+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "ccfacab1-4d05-4b89-a17e-932d872ded9e",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "robert.svab@robert.svab.com",
    "encrypted_password": "$2a$10$qrHXVIYk/ewdpCnBf4sKXOui9T6etpAxWqzMVtbzsYNDCoaIboKGW",
    "email_confirmed_at": "2025-10-01 09:36:57.694895+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:36:57.698571+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "ccfacab1-4d05-4b89-a17e-932d872ded9e",
      "email": "robert.svab@robert.svab.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:36:57.685022+00",
    "updated_at": "2025-10-01 09:36:57.700449+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:36:57.694895+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "cfadce6f-3426-4aaa-8421-fc666530da7e",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "tihomir.simunic@tihomir.simunic.com",
    "encrypted_password": "$2a$10$rQpKDh2skf2.MeEvm54EJe.qwa2n6zgt9lD4xNNB9CFONl0RIlQ9C",
    "email_confirmed_at": "2025-10-01 09:36:34.74523+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:36:34.749778+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "cfadce6f-3426-4aaa-8421-fc666530da7e",
      "email": "tihomir.simunic@tihomir.simunic.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:36:34.738594+00",
    "updated_at": "2025-10-01 09:36:34.751304+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:36:34.74523+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "4e535840-951e-4c27-9aa1-25c18c11ebfc",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "mario.strok@mario.strok.com",
    "encrypted_password": "$2a$10$IkZbDtAbCbNJnCChD.Mghu8QASU3SXEVw9/hu0tehjRctlKIzSaEa",
    "email_confirmed_at": "2025-10-01 09:36:45.024601+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:36:45.03935+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "4e535840-951e-4c27-9aa1-25c18c11ebfc",
      "email": "mario.strok@mario.strok.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:36:44.996512+00",
    "updated_at": "2025-10-01 09:36:45.048066+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:36:45.024601+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  },
  {
    "instance_id": "00000000-0000-0000-0000-000000000000",
    "id": "6e91e630-9e50-4a38-85ab-471c222d5d15",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "ivan.zupan@ivan.zupan.com",
    "encrypted_password": "$2a$10$ybUGXuUDHq9FwqkWHQmYfe83JqXqttG/2CFV.twwQg3Z5HMjbTtR.",
    "email_confirmed_at": "2025-10-01 09:37:14.455387+00",
    "invited_at": null,
    "confirmation_token": "",
    "confirmation_sent_at": null,
    "recovery_token": "",
    "recovery_sent_at": null,
    "email_change_token_new": "",
    "email_change": "",
    "email_change_sent_at": null,
    "last_sign_in_at": "2025-10-01 09:37:14.458793+00",
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ]
    },
    "raw_user_meta_data": {
      "sub": "6e91e630-9e50-4a38-85ab-471c222d5d15",
      "email": "ivan.zupan@ivan.zupan.com",
      "email_verified": true,
      "phone_verified": false
    },
    "is_super_admin": null,
    "created_at": "2025-10-01 09:37:14.44862+00",
    "updated_at": "2025-10-01 09:37:14.461363+00",
    "phone": null,
    "phone_confirmed_at": null,
    "phone_change": "",
    "phone_change_token": "",
    "phone_change_sent_at": null,
    "confirmed_at": "2025-10-01 09:37:14.455387+00",
    "email_change_token_current": "",
    "email_change_confirm_status": 0,
    "banned_until": null,
    "reauthentication_token": "",
    "reauthentication_sent_at": null,
    "is_sso_user": false,
    "deleted_at": null,
    "is_anonymous": false
  }
]'::jsonb
),

-- =======================================================================
-- 2. USER ID MAPPING: FIX: Use aggressive stripping for maximum match success.
-- Strips all non-alphanumeric characters from the local part of the email.
-- =======================================================================
user_map AS (
    SELECT
        f_user.key AS firebase_user_id,
        s_user ->> 'id' AS supabase_user_id
    FROM
        users_firebase_json u_f,
        users_supabase_json u_s,
        jsonb_each(u_f.j -> 'data') AS f_user(key, value),
        jsonb_array_elements(u_s.j) AS s_user
    WHERE
        -- Aggressive Normalization: 
        -- 1. Get local part of email (before @)
        -- 2. Convert to lowercase
        -- 3. Strip all characters that are NOT a standard letter (a-z) or number (0-9)
        REGEXP_REPLACE(LOWER(REGEXP_REPLACE(f_user.value ->> 'email', '@.*', '', 'g')), '[^a-z0-9]', '', 'g')
        = 
        REGEXP_REPLACE(LOWER(REGEXP_REPLACE(s_user ->> 'email', '@.*', '', 'g')), '[^a-z0-9]', '', 'g')
),

-- 3. EXTRACT GROUPS: Extracts group data and generates new target UUIDs.
group_data AS (
    SELECT
        g.key AS firebase_group_id,
        g.value ->> 'name' AS name,
        g.value ->> 'color' AS color,
        (g.value -> 'createdAt' ->> '__time__')::timestamptz AS created_at,
        g.value -> 'memberIds' AS firebase_member_ids,
        gen_random_uuid() AS new_group_uuid
    FROM
        groups_json gj,
        jsonb_each(gj.j -> 'data') AS g(key, value)
),

-- 4. INSERT Groups into public.group (Confirmed working)
group_insertion AS (
    INSERT INTO public.group (id, name, color, created_at, is_deleted)
    SELECT
        new_group_uuid,
        name,
        color,
        created_at,
        FALSE
    FROM
        group_data
    RETURNING
        id
),

-- 5. GROUP MEMBER INSERTION: Relies on the fixed user_map
group_member_insertion AS (
    INSERT INTO public.group_member (group_id, user_id, is_deleted)
    SELECT
        gd.new_group_uuid,
        um.supabase_user_id::uuid, 
        FALSE
    FROM
        group_data gd
    CROSS JOIN LATERAL
        jsonb_array_elements_text(gd.firebase_member_ids) AS member_id_text(firebase_member_id)
    JOIN
        user_map um ON um.firebase_user_id = member_id_text.firebase_member_id
    RETURNING 1
),

-- 6. EXTRACT MATCHES: Uses CROSS JOIN LATERAL for safe unnesting.
temp_match_data AS (
    SELECT
        gd.new_group_uuid AS group_id,
        (m.value ->> 'playerOneId') AS player_one_firebase_id,
        (m.value ->> 'playerTwoId') AS player_two_firebase_id,
        (m.value ->> 'winnerId') AS winner_firebase_id,
        m.value -> 'sets' AS sets,
        CASE m.value ->> 'status'
            WHEN 'Završen' THEN 'completed'::text
            WHEN 'Čeka' THEN 'waiting'::text
            ELSE 'waiting'::text
        END AS status,
        gd.created_at AS created_at
    FROM
        groups_json gj
    CROSS JOIN LATERAL
        jsonb_each(gj.j -> 'data') AS g(key, value)
    CROSS JOIN LATERAL
        jsonb_each(g.value -> '__collections__' -> 'matches') AS m(match_key, value)
    JOIN
        group_data gd ON gd.firebase_group_id = g.key
)

-- 7. MATCH INSERTION: Relies on the fixed user_map
INSERT INTO public.match (id, group_id, player_one_id, player_two_id, sets, winner_id, status, created_at, is_surrender)
SELECT
    gen_random_uuid(), 
    tmd.group_id,
    p1_map.supabase_user_id::uuid AS player_one_id, 
    p2_map.supabase_user_id::uuid AS player_two_id, 
    tmd.sets,
    CASE WHEN tmd.winner_firebase_id != '' THEN w_map.supabase_user_id::uuid ELSE NULL END AS winner_id,
    tmd.status::match_status,
    tmd.created_at,
    FALSE
FROM
    temp_match_data tmd
JOIN
    user_map p1_map ON p1_map.firebase_user_id = tmd.player_one_firebase_id
JOIN
    user_map p2_map ON p2_map.firebase_user_id = tmd.player_two_firebase_id
LEFT JOIN
    user_map w_map ON w_map.firebase_user_id = tmd.winner_firebase_id
;
-- =======================================================================
-- 8. DEBUGGING QUERIES (UNCOMMENT TO CHECK FOR UNMAPPED USERS)
-- =======================================================================

-- Run these queries *separately* if the inserts fail again.
-- They will show you the Firebase IDs that could not be mapped to a Supabase ID.

-- SELECT 'UNMAPPED_GROUP_MEMBER_ID' AS reason, member_id_text.firebase_member_id AS firebase_id, gd.firebase_group_id AS source_group_id
-- FROM group_data gd
-- CROSS JOIN LATERAL jsonb_array_elements_text(gd.firebase_member_ids) AS member_id_text(firebase_member_id)
-- LEFT JOIN user_map um ON um.firebase_user_id = member_id_text.firebase_member_id
-- WHERE um.supabase_user_id IS NULL;

-- SELECT 'UNMAPPED_MATCH_PLAYER' AS reason, tmd.player_one_firebase_id AS firebase_id, tmd.group_id AS target_group_uuid
-- FROM temp_match_data tmd
-- LEFT JOIN user_map p1_map ON p1_map.firebase_user_id = tmd.player_one_firebase_id
-- WHERE p1_map.supabase_user_id IS NULL

-- UNION ALL

-- SELECT 'UNMAPPED_MATCH_PLAYER' AS reason, tmd.player_two_firebase_id AS firebase_id, tmd.group_id AS target_group_uuid
-- FROM temp_match_data tmd
-- LEFT JOIN user_map p2_map ON p2_map.firebase_user_id = tmd.player_two_firebase_id
-- WHERE p2_map.supabase_user_id IS NULL;
