# pip install dash
# to run: python dashDemo3Data.py
# View on your browser at http://127.0.0.1:8050/
import dash
import dash_core_components as dcc
import dash_html_components as html
from dash_html_components import Br
from numpy import append
import plotly.express as px
import dash_table
import pandas as pd
from readDB import ReadMongoData as db

# app = dash.Dash(__name__)
app = dash.Dash("app")

df = db.getBookingDetails()

# Convert the Decimal128 columns to float to work for the dash_table.DataTable
df[["BasePrice", "AgencyCommission"]] = df[[
    "BasePrice", "AgencyCommission"]].astype(str).astype(float)

# Summary for destinations
df_group_destination = df.groupby(["Destination"]).sum()[
    ["BasePrice", "AgencyCommission"]]
fig = px.bar(df_group_destination, x=df_group_destination.index, y="BasePrice")

app.layout = html.Div(
    children=[
        html.A(href='/', children='Home'),
        html.H1(children='Travel Experts data'),
        html.Div(children=[
            'TravelExperts Booking details table with a bar chart of showing the sales per destination.'
        ]),
        html.Br(),
        dash_table.DataTable(
            id='mytable',
            columns=[{"name": i, "id": i} for i in df.columns],
            data=df.to_dict('records'),
            page_action='native',
            page_size=10
        ),
        dcc.Graph(figure=fig)
    ]
)

# if __name__ == '__main__':
app.run_server(debug=True)
