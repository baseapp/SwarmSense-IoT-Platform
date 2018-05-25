import React from "react";
import { List, Datagrid, TextField, BooleanField, ReferenceField, EditButton} from "admin-on-rest";
import { Responsive } from "admin-on-rest";
import { SimpleList } from "../index";
import IconButton from "material-ui/IconButton";
import FileCloudDownload from 'material-ui/svg-icons/file/cloud-download';

let API_URL = window.API_URL;

const DownloadField = ({source, record = {}}) => (
    <IconButton
        tooltip="Download Files"
        href={`${API_URL}/ota/firmwares/${record.id}/download`}
    >
        <FileCloudDownload/>
    </IconButton>
);

const FirmwareList = props => (
    <List {...props} title="Firmwares for OTA">
        <Responsive
            small={
                <SimpleList
                    primaryText={record => `${record.name}`}
                    secondaryText={record => `Version: ${record.version}`}
                    tertiaryText={record => `Sensor Type: ${record.sensor_type}`}
                    rightIcon={record => {}}
                />
            }
            medium={
                <Datagrid bodyOptions={{ showRowHover: true }}>
                    <TextField source="id" />
                    <TextField source="name" />
                    <TextField source="version" style={{ color: 'purple' }}/>
                    <BooleanField source="is_deployed" headerStyle={{ textAlign: 'center' }}/>
                    <EditButton />
                    <DownloadField label="Download" />
                </Datagrid>
            }
        />
    </List>
)
export default FirmwareList;