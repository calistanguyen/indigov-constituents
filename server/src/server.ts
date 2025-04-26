import express, { json } from "express";
import { RequestHandler } from "express";
import cors from "cors";
import { createReadStream, writeFileSync } from "fs";
import csvParser from "csv-parser";
import { join } from "path";
import fileUpload, { UploadedFile } from "express-fileupload";
import {
  Constituent,
  GetConstituentParams,
  NewConstituentBody,
  UpdateConstituentBody,
  StatusResponse,
  ExportConstituentsByDateParams,
  FileUpload,
} from "./types";
import { Readable } from "stream";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(json());
app.use(fileUpload());

let constituents: Constituent[] = [];

const loadConstituentsFromCSV = (): void => {
  constituents = [];
  createReadStream(join(__dirname, "constituents.csv"))
    .pipe(csvParser())
    .on("data", (data: Constituent) => {
      const constituent: Constituent = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        city: data.city,
        state: data.state,
        zip: data.zip,
        phone: data.phone,
        signUpDate: data.signUpDate,
      };
      constituents.push(constituent);
    })
    .on("end", () => {
      console.log("CSV data loaded successfully");
    });
};

const mapConstituentToCSV = (constituent: Constituent): string => {
  return `${constituent.email},${constituent.firstName},${constituent.lastName},${constituent.city},${constituent.state},${constituent.zip},${constituent.phone},${constituent.signUpDate}`;
};

const CSV_HEADER = "email,firstName,lastName,city,state,zip,phone,signUpDate\n";

loadConstituentsFromCSV();

const saveConstituentsToCSV = (): void => {
  const csvContent = constituents
    .map((constituent) => mapConstituentToCSV(constituent))
    .join("\n");
  writeFileSync(join(__dirname, "constituents.csv"), CSV_HEADER + csvContent);
};

app.get("/constituents", ((_req, res) => {
  res.json(constituents);
}) as RequestHandler<{}, Constituent[]>);

app.get("/constituents/export", ((req, res) => {
  const startDate = new Date(req.query.startDate);
  const endDate = new Date(req.query.endDate);

  let filteredConstituents = [...constituents];

  filteredConstituents = filteredConstituents.filter(
    (constituent) =>
      new Date(constituent.signUpDate) >= startDate &&
      new Date(constituent.signUpDate) <= endDate
  );

  const csvContent = filteredConstituents
    .map((constituent) => mapConstituentToCSV(constituent))
    .join("\n");

  let filename = "constituents";
  if (startDate)
    filename += `_from_${startDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })}`;
  if (endDate)
    filename += `_to_${endDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })}`;
  filename += ".csv";

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  res.send(CSV_HEADER + csvContent);
}) as RequestHandler<{}, any, {}, ExportConstituentsByDateParams>);

app.get("/constituents/:email", ((req, res) => {
  const email = req.params.email;
  const constituent = constituents.find(
    (constituent) => constituent.email === email
  );

  if (!constituent) {
    return res.status(404).json({ message: "Constituent not found" });
  }

  res.json(constituent);
}) as RequestHandler<GetConstituentParams, Constituent | StatusResponse>);

app.post("/constituents", ((req, res) => {
  const { email, firstName, lastName, city, state, zip, phone } = req.body;

  if (!email || !firstName || !lastName || !city || !state || !zip || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (constituents.find((constituent) => constituent.email === email)) {
    return res.status(400).json({ message: "Constituent already exists" });
  }

  const newConstituent: Constituent = {
    email,
    firstName,
    lastName,
    city,
    state,
    zip,
    phone,
    signUpDate: new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
  };

  constituents.push(newConstituent);
  saveConstituentsToCSV();

  res.status(201).json(newConstituent);
}) as RequestHandler<{}, Constituent | { message: string }, NewConstituentBody>);

app.put("/constituents/:email", ((req, res) => {
  const email = req.params.email;

  const { firstName, lastName, city, state, zip, phone } =
    req.body as Constituent;

  const constituentIndex = constituents.findIndex(
    (constituent) => constituent.email === email
  );

  if (constituentIndex === -1) {
    return res.status(404).json({ message: "Constituent not found" });
  }

  firstName && (constituents[constituentIndex].firstName = firstName);
  lastName && (constituents[constituentIndex].lastName = lastName);
  city && (constituents[constituentIndex].city = city);
  state && (constituents[constituentIndex].state = state);
  zip && (constituents[constituentIndex].zip = zip);
  phone && (constituents[constituentIndex].phone = phone);

  saveConstituentsToCSV();

  res.json(constituents[constituentIndex]);
}) as RequestHandler<GetConstituentParams, Constituent | StatusResponse, UpdateConstituentBody>);

app.delete("/constituents/:email", ((req, res) => {
  const email = req.params.email;
  const constituentIndex = constituents.findIndex(
    (constituent) => constituent.email === email
  );

  if (constituentIndex === -1) {
    return res.status(404).json({ message: "Constituent not found" });
  }

  constituents.splice(constituentIndex, 1);
  saveConstituentsToCSV();

  res.status(204).send();
}) as RequestHandler<{ email: string }, StatusResponse>);

app.post("/constituents/submit", (async (req, res) => {
  if (!req.files || !req.files.csv) {
    return res.status(400).json({ message: "CSV file is required" });
  }

  try {
    const csvFile = req.files.csv as UploadedFile;
    const fileBuffer = csvFile.data;

    const bufferStream = Readable.from(fileBuffer);

    await new Promise<void>((resolve, reject) => {
      bufferStream
        .pipe(csvParser())
        .on("data", (data: Constituent) => {
          const constituent: Constituent = {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            city: data.city,
            state: data.state,
            zip: data.zip,
            phone: data.phone,
            signUpDate: data.signUpDate,
          };
          const existingIndex = constituents.findIndex(
            (constituent) => constituent.email === constituent.email
          );

          if (existingIndex !== -1) {
            constituents[existingIndex] = constituent;
          } else {
            constituents.push(constituent);
          }
        })
        .on("end", () => {
          saveConstituentsToCSV();
          resolve();
        })
        .on("error", (error: Error) => {
          reject(error);
        });
    });

    res.status(200).json({ message: "CSV data merged successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error processing file upload" });
  }
}) as RequestHandler<{}, StatusResponse, FileUpload>);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
