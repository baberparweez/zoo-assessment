import React from "react";
import { Container, Typography } from "@mui/material";
import AnimalList from "./AnimalList";

const App = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Zoo Animal Management
      </Typography>
      <AnimalList />
    </Container>
  );
};

export default App;
