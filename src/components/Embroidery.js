import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import dmcData from '../data/dmc_floss_data.json';

function Embroidery() {
    const columns = [
        { field: 'floss', headerName: 'DMC Number', width: 130 },
        { field: 'name', headerName: 'Color Name', width: 200 },
        { 
            field: 'hex', 
            headerName: 'Color', 
            width: 130,
            renderCell: (params) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                        style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: params.value,
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    />
                    {params.value}
                </div>
            ),
        }
    ];

    return (
        <div className="content-container">
            <div className="craft-section">
                <h1>DMC Floss Colors</h1>
                <div style={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={dmcData.map((item, index) => ({
                            id: index,
                            ...item
                        }))}
                        columns={columns}
                        pageSize={25}
                        rowsPerPageOptions={[25]}
                        disableSelectionOnClick
                        sx={{
                            backgroundColor: 'white',
                            '& .MuiDataGrid-cell': {
                                borderColor: '#f0f0f0'
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default Embroidery;
