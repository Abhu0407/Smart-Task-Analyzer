from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Task(models.Model):
    id = models.AutoField(primary_key=True)

    # Each user has unique task numbers
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    number = models.PositiveIntegerField()

    title = models.CharField(max_length=255)
    due_date = models.DateField()
    estimated_hours = models.IntegerField()

    importance = models.IntegerField()  # 1–10 scale

    # Self-referencing dependency — tasks must already exist
    dependencies = models.ManyToManyField(
        "self",
        symmetrical=False,
        blank=True,
        related_name="required_by"
    )

    priorityScore = models.FloatField(default=0.0)
    smartPriorityScore = models.FloatField(default=0.0)

    completed = models.BooleanField(default=False)
    circularTask = models.BooleanField(default=False)

    class Meta:
        # UNIQUE per user
        unique_together = ("user", "number")

    def __str__(self):
        return f"User {self.user} • Task {self.number}: {self.title}"
