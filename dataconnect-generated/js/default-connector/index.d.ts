import { ConnectorConfig } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Chapter_Key {
  id: UUIDString;
  __typename?: 'Chapter_Key';
}

export interface Character_Key {
  id: UUIDString;
  __typename?: 'Character_Key';
}

export interface Collaboration_Key {
  collaboratorId: UUIDString;
  storyId: UUIDString;
  __typename?: 'Collaboration_Key';
}

export interface Location_Key {
  id: UUIDString;
  __typename?: 'Location_Key';
}

export interface Story_Key {
  id: UUIDString;
  __typename?: 'Story_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

