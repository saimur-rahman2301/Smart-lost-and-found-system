cmake_minimum_required(VERSION 3.20)

# Gather all test source files
file(GLOB_RECURSE ENGINE_TEST_SOURCES
  "${CMAKE_CURRENT_SOURCE_DIR}/engine/*.cpp"
)

if(ENGINE_TEST_SOURCES)
  add_executable(findx_tests
    ${CMAKE_CURRENT_SOURCE_DIR}/main_test.cpp
    ${ENGINE_TEST_SOURCES}
  )
  target_include_directories(findx_tests PRIVATE
    ${CMAKE_SOURCE_DIR}/server/include
    ${PostgreSQL_INCLUDE_DIRS}
  )
  target_link_libraries(findx_tests PRIVATE
    Catch2::Catch2WithMain
    nlohmann_json::nlohmann_json
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
  )
  target_compile_features(findx_tests PRIVATE cxx_std_17)
  
  include(CTest)
  include(Catch)
  catch_discover_tests(findx_tests
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
  )
endif()
