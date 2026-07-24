import { z } from "zod";

export const FlightCardProps = z.object({
  title: z.string().describe("Flight card title"),
  airline: z.string().describe("Airline name"),
  origin: z.string().describe("Departure airport/city"),
  destination: z.string().describe("Arrival airport/city"),
  departure_time: z.string().describe("Departure time"),
  price: z.string().describe("Price display"),
});

type FlightCardProps = z.infer<typeof FlightCardProps>;

export function FlightCard({
  title,
  airline,
  origin,
  destination,
  departure_time,
  price,
}: FlightCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden max-w-sm">
      <div className="bg-gray-900 text-white px-4 py-2.5 flex items-center justify-between">
        <span className="font-semibold text-sm">{airline}</span>
        <span className="text-xs text-gray-300">{title}</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{origin}</div>
            <div className="text-xs text-gray-500">Origin</div>
          </div>
          <div className="flex-1 mx-3 flex items-center">
            <div className="flex-1 border-t border-dashed border-gray-300" />
            <svg className="mx-2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
            <div className="flex-1 border-t border-dashed border-gray-300" />
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{destination}</div>
            <div className="text-xs text-gray-500">Destination</div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500">Departure</div>
            <div className="text-sm font-medium text-gray-700">{departure_time}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Price</div>
            <div className="text-lg font-bold text-gray-900">{price}</div>
          </div>
        </div>
      </div>
      <div className="border-t border-dashed border-gray-200 px-4 py-3 bg-gray-50 flex items-center justify-between">
        <svg className="h-8 flex-1" preserveAspectRatio="none" viewBox="0 0 200 40">
          {[0,4,7,10,12,16,18,21,24,26,29,31,34,37,39,42,45,48,50,53,56,58,61,63,66,69,72,74,77,80,82,85,88,90,93,96,98,101,104,106,109,112,114,117,120,123,125,128,131,133,136,139,141,144,147,149,152,155,157,160,163,166,168,171,174,176,179,182,184,187,190,193,196].map((x, i) => (
            <rect key={i} x={x} y="0" width={[2,3,1,2,3,1,2,1,3,2,1,3,2,1,2,3,1,2,3,1,2,1,3,2,1,2,3,1,2,1,3,2,1,2,3,1,2,1,3,2,1,3,2,1,2,3,1,2,1,3,2,1,2,3,1,2,1,3,2,1,2,3,1,2,1,3,2,1,2,3,1,2,1][i]} height="40" fill="#1f2937" />
          ))}
        </svg>
        <span className="ml-3 text-[10px] text-gray-400 tracking-widest font-mono whitespace-nowrap">BOARDING PASS</span>
      </div>
    </div>
  );
}
