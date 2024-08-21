import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

const modifyString = function (string) {
  return string[0].toUpperCase() + string.replace(/-/g, " ").slice(1);
};
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const processData = (data, interval) => {
  // Sort the data by year and month
  const sortedData = data.sort((a, b) => {
    if (a._id.year === b._id.year) {
      return a._id.month - b._id.month;
    }
    return a._id.year - b._id.year;
  });

  let propName = "count";
  for (const [key, value] of Object.entries(data[0])) {
    propName = key;
  }

  const aggregateData = (interval) => {
    let groupedData = {};

    switch (interval) {
      case "daily":
        data.forEach((entry) => {
          const date = `${entry._id.year}-${String(
            months[entry._id.month - 1].slice(0, 3)
          ).padStart(2, "0")}-${String(entry._id.day || 1).padStart(2, "0")}`;
          groupedData[date] = (groupedData[date] || 0) + entry[propName];
        });
        break;

      case "monthly":
        data.forEach((entry) => {
          const date = `${entry._id.year}-${String(
            months[entry._id.month - 1].slice(0, 3)
          ).padStart(2, "0")}`;
          groupedData[date] = (groupedData[date] || 0) + entry[propName];
        });
        break;

      case "quarterly":
        data.forEach((entry) => {
          const quarter = Math.ceil(entry._id.month / 3);
          const date = `${entry._id.year}-Q${quarter}`;
          groupedData[date] = (groupedData[date] || 0) + entry[propName];
        });
        break;

      case "yearly":
        data.forEach((entry) => {
          const date = `${entry._id.year}`;
          groupedData[date] = (groupedData[date] || 0) + entry[propName];
        });
        break;

      default:
        console.warn("Unsupported interval type");
        return { labels: [], counts: [] };
    }
    console.log(groupedData);
    return groupedData;
  };

  const aggregatedData = aggregateData(interval);
  const labels = Object.keys(aggregatedData);
  const counts = Object.values(aggregatedData);

  return { labels, counts };
};

const Charts = (props) => {
  const [chartType, setChartType] = useState("line");
  const [graphData, setGraphData] = useState([]);
  const [interval, setInterval] = useState("monthly"); // Default to monthly
  const handleDropdownChange = (event) => {
    setInterval(event.target.value);
  };
  useEffect(() => {
    // Update graphData when props.data.apiData changes
    if (props.data && props.data.apiData) {
      setGraphData(props.data.apiData);
    }
  }, [props.data]);
  // Only render the chart if `graphData` has been populated
  if (!graphData.length) {
    return <div>Loading...</div>; // Or some placeholder
  }

  const { labels, counts } = processData(graphData, interval);
  const data = {
    labels: labels,
    datasets: [
      {
        label: modifyString(props.data.title),
        data: counts,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `${modifyString(props.data.title)} over time`,
      },
    },
  };

  const toggleChartType = () => {
    setChartType((prevType) => (prevType === "line" ? "bar" : "line"));
  };

  return (
    <div>
      <Grid container spacing={"auto"} sx={{ marginBottom: "20px" }}>
        <Grid item xs={6}>
          <Button
            onClick={toggleChartType}
            variant="outlined"
            sx={{ mx: "auto" }}
          >
            Switch to {chartType === "line" ? "Bar" : "Line"} Chart
          </Button>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={interval}
              onChange={handleDropdownChange}
            >
              <MenuItem value={"yearly"}>Yearly</MenuItem>
              <MenuItem value={"monthly"}>Monthly</MenuItem>
              <MenuItem value={"quarterly"}>Quarterly</MenuItem>
              <MenuItem value={"daily"}>Daily</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {chartType === "line" ? (
        <Line data={data} options={options} />
      ) : (
        <Bar data={data} options={options} />
      )}
    </div>
  );
};

export default Charts;
