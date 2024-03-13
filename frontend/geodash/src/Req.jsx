/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './css/filters.css';

const Req = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [submittedDates, setSubmittedDates] = useState(null);

  const [clients, setClients] = useState([]);
  const [options, setoptions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/uniqueClientIds`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Error: ' + response.status);
        }
      })
      .then((data) => {
        console.log('Data received from the API:', data);
        const dt = data.map((d1) => {
          return { value: d1, label: d1 };
        });

        return dt;
      })
      .then((dt) => {
        setClients(dt);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleChange = async (selected) => {
    setSelected(selected);
    const clientIds = await selected.map((item) => item.value);
    setoptions(clientIds);
  };

  const handleFromDateChange = (event) => {
    const date = event.target.value;
    setFromDate(date);

    // Ensure toDate is not smaller than fromDate
    if (new Date(date) > new Date(toDate)) {
      setToDate(date);
    }
    setSubmittedDates({ from_date: fromDate });
  };

  const handleToDateChange = (event) => {
    const date = event.target.value;
    setToDate(date);

    // Ensure fromDate is not greater than toDate
    if (new Date(date) < new Date(fromDate)) {
      setFromDate(date);
      setSubmittedDates({ to_date: toDate });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (toDate === '' || fromDate === '' || options.length === 0) {
      if (fromDate === '') {
        const date = new Date('1970-01-01').toISOString().split('T')[0];
        setFromDate(date);
      }
      if (toDate === '') {
        const date = new Date().toISOString().split('T')[0];
        setToDate(date);
      }
      if (options.length === 0) {
        alert('Please select clients');
      }
    }

    fetch(
      `http://localhost:3001/filter?fd=${fromDate}&td=${toDate}&clients=${options.toString()}`
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Error: ' + response.status);
        }
      })
      .then((data) => {
        // Process the received data as needed
        return data.map((info) => {
          return `<tr>
              <td>${info.logId.S}</td>
              <td>${info.createdAt.S}</td>
              <td>${info.clientId.S}</td>
              <td>${info.query.S}</td>
              </tr>
              `;
        });
      })
      .then((DisplayData) => {
        document.getElementById('data').innerHTML = `<table>
                      <thead>
                          <tr>
                          <th>LogId</th>
                          <th>Created At</th>
                          <th>ClientId</th>
                          <th>Query</th>
                          </tr>
                      </thead>
                      <tbody id='tbody'>

                      </tbody>
                  </table>`;
        DisplayData.forEach((element) => {
          document.getElementById('tbody').innerHTML += element;
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };
  return (
    <form id="filterForm" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="fromDate">From Date:</label>
        <input
          type="date"
          id="fromDate"
          value={fromDate}
          onChange={handleFromDateChange}
          defaultValue={new Date('1970-01-01')}
          min={'01-01-1970'}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <label htmlFor="toDate">To Date:</label>
        <input
          type="date"
          id="toDate"
          value={toDate}
          onChange={handleToDateChange}
          defaultValue={new Date()}
          min={fromDate}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <Select
        id="client"
        isMulti
        isSearchable
        options={clients}
        name="client"
        placeholder="Choose clients"
        value={selected}
        onChange={handleChange}
        styles={{
          option: (provided, state) => ({
            ...provided,

            color: state.isSelected ? 'white' : 'black',

            // Add more custom styles here
          }),
        }}
      />
      <button id="submitButton" type="submit">
        Submit Dates
      </button>
    </form>
  );
};

export default Req;
