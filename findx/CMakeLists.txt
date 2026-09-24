cmake_minimum_required(VERSION 3.20)
project(findx VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Build type
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release)
endif()

# Compiler warnings
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
  if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    add_compile_options(-g -O0 -fsanitize=address)
    add_link_options(-fsanitize=address)
  else()
    add_compile_options(-O2)
  endif()
endif()

# ─── Dependencies via FetchContent ─────────────────────────────────────────
include(FetchContent)

# Crow — C++ HTTP/WebSocket micro-framework
FetchContent_Declare(
  Crow
  GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
  GIT_TAG        v1.2.0
)
FetchContent_MakeAvailable(Crow)

# nlohmann/json — JSON for Modern C++
FetchContent_Declare(
  nlohmann_json
  GIT_REPOSITORY https://github.com/nlohmann/json.git
  GIT_TAG        v3.11.3
)
FetchContent_MakeAvailable(nlohmann_json)

# Catch2 — C++ unit testing framework
FetchContent_Declare(
  Catch2
  GIT_REPOSITORY https://github.com/catchorg/Catch2.git
  GIT_TAG        v3.7.1
)
FetchContent_MakeAvailable(Catch2)

# ─── Find system packages ─────────────────────────────────────────────────
find_package(OpenSSL REQUIRED)
find_package(PostgreSQL REQUIRED)
find_package(Threads REQUIRED)

# ─── Subdirectories ───────────────────────────────────────────────────────
add_subdirectory(server)
