import asyncio
import datetime
from hyperliquid.info import Info
from hyperliquid.utils import constants
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

VAULT_ADDRESSES = {
    "Leader": "0x677d831aef5328190852e24f13c46cac05f984e7",
    "HLP Strategy A": "0x010461c14e146ac35fe42271bdc1134ee31c703a",
    "HLP Strategy Liquidator": "0x2e3d94f0562703b25c83308a05046ddaf9a8dd14",
    "HLP Strategy B": "0x31ca8395cf837de08b24da3f660e77761dfb974b",
    "HLP": "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303"
}

async def get_vault_data(vault_address):
    info = Info(constants.MAINNET_API_URL)
    
    # Get trade history for the last 30 days
    end_time = int(datetime.datetime.now().timestamp() * 1000)
    start_time = int((datetime.datetime.now() - datetime.timedelta(days=30)).timestamp() * 1000)
    print(f"Start time: {start_time}")
    # Use asyncio.to_thread to run the synchronous function in a separate thread
    trade_history = await asyncio.to_thread(info.user_fills_by_time, vault_address, start_time, end_time)
    print(f"API response: {trade_history}")
    # Get current TVL
    user_state = await asyncio.to_thread(info.user_state, vault_address)
    tvl = user_state["marginSummary"]["accountValue"]

    # Format trade history
    print(f"Trade history: {trade_history}")
    formatted_trade_history = []
    for trade in trade_history:
        print(f"Timestamp antes da conversão: {trade['time']}")
        print(f"Trade antes da formatação: {trade}")
        import pytz
        utc = pytz.UTC
        formatted_trade = {
            "closedPnl": trade.get("closedPnl"),
            "coin": trade.get("coin"),
            "dir": trade.get("dir"),
            "px": trade.get("px"),
            "sz": trade.get("sz"),
            "time": datetime.datetime.fromtimestamp(trade["time"] / 1000, tz=utc).strftime('%Y-%m-%d %H:%M:%S %Z'),
        }
        formatted_trade_history.append(formatted_trade)
    
    return formatted_trade_history, tvl

@app.route('/')
def index():
    return send_from_directory(os.getcwd(), 'index.html')

@app.route('/<path:path>')
def send_report(path):
    return send_from_directory(os.getcwd(), path)

@app.route('/data')
def get_data():
    data = []
    for vault_name, vault_address in VAULT_ADDRESSES.items():
        trade_history, tvl = asyncio.run(get_vault_data(vault_address))
        data.append({
            "name": vault_name,
            "address": vault_address,
            "trade_history": trade_history,
            "tvl": tvl
        })
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=8000)