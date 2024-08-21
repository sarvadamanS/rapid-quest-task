import { useEffect, useState } from "react";
import "./App.css";
import { green, purple } from "@mui/material/colors";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Alert, Button, Card } from "@mui/material";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InfoIcon from "@mui/icons-material/Info";
import LineChart from "./Charts";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import FaceIcon from "@mui/icons-material/Face";
import RepeatIcon from "@mui/icons-material/Repeat";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { color } from "chart.js/helpers";
import MapComponent from "./Maps";

const drawerWidth = 240;
const rawData = [
  { _id: { year: 2020, month: 7 }, count: 18 },
  { _id: { year: 2020, month: 5 }, count: 20 },
  { _id: { year: 2021, month: 9 }, count: 19 },
  { _id: { year: 2021, month: 10 }, count: 19 },
  { _id: { year: 2021, month: 4 }, count: 17 },
  { _id: { year: 2020, month: 11 }, count: 23 },
  { _id: { year: 2020, month: 4 }, count: 18 },
  { _id: { year: 2021, month: 11 }, count: 23 },
  { _id: { year: 2021, month: 5 }, count: 17 },
  { _id: { year: 2021, month: 3 }, count: 19 },
  { _id: { year: 2021, month: 2 }, count: 19 },
  { _id: { year: 2021, month: 1 }, count: 22 },
  { _id: { year: 2020, month: 10 }, count: 30 },
  { _id: { year: 2020, month: 12 }, count: 31 },
  { _id: { year: 2021, month: 8 }, count: 25 },
  { _id: { year: 2021, month: 12 }, count: 17 },
  { _id: { year: 2020, month: 6 }, count: 20 },
  { _id: { year: 2020, month: 3 }, count: 25 },
  { _id: { year: 2021, month: 7 }, count: 23 },
  { _id: { year: 2020, month: 2 }, count: 19 },
  { _id: { year: 2020, month: 1 }, count: 23 },
  { _id: { year: 2021, month: 6 }, count: 22 },
  { _id: { year: 2020, month: 9 }, count: 18 },
  { _id: { year: 2020, month: 8 }, count: 13 },
];
function App() {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [data, setData] = useState({
    mode: "graph",
    title: "Counts",
    apiData: null,
  });
  let url = window.location.origin.includes("localhost")
    ? "http://localhost:5000"
    : window.location.origin;
  const menuItems = [
    ["Total Sales Over Time", "total-sales", <AttachMoneyIcon />],
    ["Sales Growth Rate Over Time", "sales-growth", <PointOfSaleIcon />],
    ["New Customers Added Over Time", "new-customers", <FaceIcon />],
    ["Number of Repeat Customers", "repeat-customers", <RepeatIcon />],
    [
      "Geographical Distribution of Customers",
      "customer-geography",
      <MyLocationIcon />,
    ],
    [
      "Customer Lifetime Value by Cohorts",
      "customer-lifetime-value",
      <SupportAgentIcon />,
    ],
  ];
  let callApi = async (mode, index) => {
    setSelectedIndex(index);
    let apiData = await fetch(`${url}/api/${mode}`);
    let extractedData = await apiData.json();
    setData((prevData) => ({
      ...prevData,
      title: mode,
      mode: mode === "customer-geography" ? "map" : "graph",
      apiData: extractedData,
    }));
  };
  useEffect(() => {
    callApi("total-sales", 0);
  }, []);
  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
            backgroundColor: "#7d3c98",
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Visualize your data
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Toolbar />
          <Divider />
          <List>
            {menuItems.map((text, index) => (
              <ListItem
                key={index}
                onClick={() => {
                  callApi(text[1], index);
                }}
                disablePadding
              >
                <ListItemButton
                  selected={selectedIndex === index}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(75,192,192,0.2)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(75,192,192,1)",
                      color: "white",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "rgba(85,172,192,1)",
                    },
                  }}
                >
                  <ListItemIcon>{text[2]}</ListItemIcon>
                  <ListItemText primary={text[0]} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {/* <Button startIcon={<InfoIcon />}>Info</Button> */}
          {/* <Alert severity="success">This is a success Alert.</Alert> */}
        </Drawer>

        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
        >
          <Toolbar />
          {data.mode === "graph" ? (
            <LineChart data={data} />
          ) : (
            <MapComponent data={data} />
          )}

          <Typography
            align="center"
            sx={{ mt: "25px", textDecoration: "underline" }}
          >
            Created by Sarvadaman Singh
          </Typography>
        </Box>
      </Box>
    </>
  );
}

export default App;
