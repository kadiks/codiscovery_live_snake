// -- START -- Hoodoo - mercredi 17 mars 2021 à 21:27
/**
 * 
// Write the code you want to submit to the live/* Liste des étapes d'un programme */
router.get("/:programId", jwt.jwt_verify, async (req, res) => {
	const program = req.params.programId;
	try {
		const steps = await Step.find({ program }).populate("program", 'keyNotions');
		console.log("Back :", steps);
		if (!steps) {
			throw { error: true, message: "Etapes introuvables" };
		}
		return res.status(200).json({
			steps,
		});
	} catch (err) {
		if (err.error) {
			res.status(404).json(err);
		} else {
			console.log(err);
			res.sendStatus(500);
		}
	}
});
 * 
 **/

// -- END -- Hoodoo - mercredi 17 mars 2021 à 21:27
// -- START -- Hoodoo - mercredi 17 mars 2021 à 21:27
/**
 * 
// Write the code you want to submit to the liveconst mongoose = require("mongoose");

const StepModel = mongoose.model(
	"Step",
	new mongoose.Schema({
		program: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
		title: { type: String, required: true },
		slug: { type: String, required: true },
		description: { type: String, required: true },
		keyNotions: [{ type: mongoose.Schema.Types.ObjectId, ref: "KeyNotion" }],
	})
);

module.exports = StepModel;
 * 
 **/

// -- END -- Hoodoo - mercredi 17 mars 2021 à 21:27
