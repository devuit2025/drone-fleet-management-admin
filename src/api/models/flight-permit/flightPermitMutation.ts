import {
  FlightPermitClient,
  type CreateFlightPermitDto,
  type UpdateFlightPermitDto,
} from './flightPermitClient';

export const FlightPermitMutation = {
  create: (data: CreateFlightPermitDto) => FlightPermitClient.create(data),
  update: (id: number, data: UpdateFlightPermitDto) => FlightPermitClient.update(id, data),
  remove: (id: number) => FlightPermitClient.remove(id),
};



