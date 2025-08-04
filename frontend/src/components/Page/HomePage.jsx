import React from "react";
import Navbar from "../Navbar";
import HeroSlider from "./HeroSlider";

const HomePage = ({ searchQuery, onSearch, isSearching }) => {
  return (
    <>
      {/* Navbar only for HomePage */}
      <Navbar onSearch={onSearch} isSearching={isSearching} />
      <HeroSlider searchQuery={searchQuery} />
    </>
  );
};

export default HomePage;
