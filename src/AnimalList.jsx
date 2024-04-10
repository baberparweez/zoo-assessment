import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Modal,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const AnimalList = () => {
  const [cachedAnimals, setCachedAnimals] = useState([]); // State variable to store the list of all animals
  const [filteredAnimals, setFilteredAnimals] = useState([]); // State variable to store the filtered list of animals based on the search filter
  const [filter, setFilter] = useState(""); // State variable to store the current search filter value
  const [sortBy, setSortBy] = useState("type"); // State variable to store the field by which the animals are sorted
  const [modalOpen, setModalOpen] = useState(false); // State variable to control the visibility of the update checkup modal
  const [selectedAnimal, setSelectedAnimal] = useState(null); // State variable to store the selected animal for updating the checkup
  const [nextCheckup, setNextCheckup] = useState(""); // State variable to store the new value of the next checkup date
  const [loading, setLoading] = useState(true); // State variable to indicate if the data is loading
  const apiUrl = "https://65f394fe105614e654a0ac9d.mockapi.io";

  // useEffect hook to fetch the list of animals when the component mounts
  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        // Check if the animal data exists in the cache
        const cachedData = localStorage.getItem("animalData");
        if (cachedData) {
          // If the data exists in the cache, parse it and set the state variables
          const parsedData = JSON.parse(cachedData);
          setCachedAnimals(parsedData);
          setFilteredAnimals(parsedData);
          setLoading(false);
        } else {
          // If the data doesn't exist in the cache, fetch it from the API
          const response = await axios.get(`${apiUrl}/api/v1/animals`);
          // Store the fetched data in the cache
          localStorage.setItem("animalData", JSON.stringify(response.data));
          setCachedAnimals(response.data);
          setFilteredAnimals(response.data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching animals:", error);
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  // Function to handle changes in the search filter input
  const handleFilterChange = (event) => {
    const { value } = event.target;
    setFilter(value);
    const filtered = cachedAnimals.filter((animal) =>
      animal.type.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredAnimals(filtered);
  };

  // Function to handle sorting the animals based on the selected field
  const handleSort = (field) => {
    setSortBy(field);
    const sorted = [...filteredAnimals].sort((a, b) => {
      if (field === "age") {
        return a[field] - b[field];
      } else if (field === "nextCheckup") {
        return new Date(a[field]) - new Date(b[field]);
      } else {
        return a[field].localeCompare(b[field]);
      }
    });
    setFilteredAnimals(sorted);
  };

  // Function to handle deleting an animal
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/v1/animals/${id}`);
      // Update the cached animal data by removing the deleted animal
      const updatedAnimals = cachedAnimals.filter((animal) => animal.id !== id);
      localStorage.setItem("animalData", JSON.stringify(updatedAnimals));
      setCachedAnimals(updatedAnimals);
      setFilteredAnimals(updatedAnimals);
    } catch (error) {
      console.error("Error deleting animal:", error);
    }
  };

  // Function to open the update checkup modal and set the selected animal
  const openModal = (animal) => {
    setSelectedAnimal(animal);
    setNextCheckup(animal.nextCheckup);
    setModalOpen(true);
  };

  // Function to close the update checkup modal and reset the selected animal and next checkup date
  const closeModal = () => {
    setSelectedAnimal(null);
    setNextCheckup("");
    setModalOpen(false);
  };

  // Function to handle updating the next checkup date for the selected animal
  const handleUpdateCheckup = async () => {
    try {
      await axios.put(`${apiUrl}/api/v1/animals/${selectedAnimal.id}`, {
        ...selectedAnimal,
        nextCheckup,
      });
      // Update the cached animal data with the updated animal
      const updatedAnimals = cachedAnimals.map((animal) =>
        animal.id === selectedAnimal.id ? { ...animal, nextCheckup } : animal
      );
      localStorage.setItem("animalData", JSON.stringify(updatedAnimals));
      setCachedAnimals(updatedAnimals);
      setFilteredAnimals(updatedAnimals);
      closeModal();
    } catch (error) {
      console.error("Error updating checkup:", error);
    }
  };

  return (
    <div>
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <>
          {/* Search filter input */}
          <TextField label="Filter by Animal Type" value={filter} onChange={handleFilterChange} />
          {/* Button to sort animals by type */}
          <Button
            variant="contained"
            onClick={() => handleSort("type")}
            sx={{
              mt: 1.5,
              ml: 2,
              mr: 1.5,
            }}
          >
            Sort by Type
          </Button>
          {/* Button to sort animals by age */}
          <Button
            variant="contained"
            onClick={() => handleSort("age")}
            sx={{
              mt: 1.5,
            }}
          >
            Sort by Age
          </Button>
          {/* Table to display the list of animals */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Next Checkup</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Map through the filtered animals and render each animal as a table row */}
                {filteredAnimals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell>{animal.type}</TableCell>
                    <TableCell>{animal.name}</TableCell>
                    <TableCell>{animal.age}</TableCell>
                    <TableCell>{animal.nextCheckup}</TableCell>
                    <TableCell>
                      {/* Button to open the update checkup modal */}
                      <Button
                        variant="outlined"
                        onClick={() => openModal(animal)}
                        sx={{
                          m: 1,
                        }}
                      >
                        Update Checkup
                      </Button>

                      {/* Button to delete the animal */}
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(animal.id)}
                        sx={{
                          m: 1,
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Modal for updating the next checkup date */}
          <Modal open={modalOpen} onClose={closeModal}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
              }}
            >
              <Typography variant="h6" component="h2">
                Update Next Checkup
              </Typography>

              {/* Input field for selecting the new next checkup date */}
              <TextField
                label="Next Checkup"
                type="date"
                value={nextCheckup}
                onChange={(e) => setNextCheckup(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  mt: 2,
                }}
              />

              {/* Button to update the next checkup date */}
              <Button
                variant="outlined"
                onClick={handleUpdateCheckup}
                sx={{
                  mt: 3,
                  ml: 2,
                }}
              >
                Update
              </Button>
            </Box>
          </Modal>
        </>
      )}
    </div>
  );
};

export default AnimalList;
