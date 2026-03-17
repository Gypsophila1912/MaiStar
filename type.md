# データ型たちの住処

### ルーム情報

```
{
    "roomId":"",
    "password":"",
    "status":"",
    "players":[
        {
            "id":"",
            "name":"",
            "isHost":"",
        }...,
    ],
    "game":null
}
```

### ゲーム情報(上記ルーム情報の一番下に入るやつ)

```
{
    "round":"number",
    "phase":"string",
    "currentPlayerIndex":"number",(現ターンプレイヤーのインデックス)
    "isFinalLap":"",
    "finaLapStartIndex":"",
    "initialHandSize":"",
    "deck":[...],
    "discard":[...],
    "players":[
        {
            "id":"",
            "name":"",
            "maiko":[...],
            "hand":[...],
            "clients":[],
            "reputationCards":[],
            "reserved":"",
            "totalScore":"",
            "roundScore":"",
        }
    ],
    "logs":[],
}
```

### ルーム情報

```
{
    "roomId":"",
    "password":"",
    "status":"",
    "players":[
        {
            "id":"",
            "name":"",
            "isHost":"",
        }...,
    ],
    "game":null
}
```
