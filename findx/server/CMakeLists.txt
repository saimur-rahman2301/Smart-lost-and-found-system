cmake_minimum_required(VERSION 3.20)

# ─── Collect server source files (exclude seed.cpp from main server) ─────
file(GLOB_RECURSE SERVER_SOURCES
  "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp"
)
list(REMOVE_ITEM SERVER_SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/src/seed.cpp")

# ─── Main server executable ──────────────────────────────────────────────
add_executable(findx_server ${SERVER_SOURCES})

target_include_directories(findx_server PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}/include
  ${PostgreSQL_INCLUDE_DIRS}
)

target_link_libraries(findx_server PRIVATE
  Crow::Crow
  nlohmann_json::nlohmann_json
  OpenSSL::SSL
  OpenSSL::Crypto
  ${PostgreSQL_LIBRARIES}
  Threads::Threads
)

# ─── Tests executable ────────────────────────────────────────────────────
file(GLOB_RECURSE TEST_SOURCES
  "${CMAKE_CURRENT_SOURCE_DIR}/tests/*.cpp"
)

if(TEST_SOURCES)
  add_executable(findx_tests ${TEST_SOURCES})
  target_include_directories(findx_tests PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${PostgreSQL_INCLUDE_DIRS}
  )
  target_link_libraries(findx_tests PRIVATE
    Catch2::Catch2WithMain
    nlohmann_json::nlohmann_json
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
  )
  include(CTest)
  include(Catch)
  catch_discover_tests(findx_tests)
endif()

# ─── Seed executable ─────────────────────────────────────────────────────
add_executable(findx_seed
  ${CMAKE_CURRENT_SOURCE_DIR}/src/seed.cpp
)
target_include_directories(findx_seed PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}/include
  ${PostgreSQL_INCLUDE_DIRS}
)
target_link_libraries(findx_seed PRIVATE
  nlohmann_json::nlohmann_json
  OpenSSL::SSL
  OpenSSL::Crypto
  ${PostgreSQL_LIBRARIES}
  Threads::Threads
)
