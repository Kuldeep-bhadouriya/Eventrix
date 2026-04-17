-- Enforce unique college roll numbers per user profile.
CREATE UNIQUE INDEX "users_collegeRollNumber_key" ON "users"("collegeRollNumber");
