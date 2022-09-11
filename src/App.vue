<script>
import CheckSquare from './icons/check-square.vue';
import Square from './icons/square.vue';
import Pencil from './icons/pencil.vue';
import Trash from './icons/trash.vue';
import PlusCircle from './icons/plus-circle.vue';
import SwitchVertical from './icons/switch-vertical.vue';
import Circle from './icons/circle.vue';
import RecordCircle from './icons/record-circle.vue';
import ChevronRight from './icons/chevron-right.vue';
import ChevronBottom from './icons/chevron-bottom.vue';
import Banner from './components/banner.vue';

let timeout;

export default {
  data() {
    return {
      data: {
        version: 2,
        // todos: [
        //   // NOTE: This is just a test object for development.
        //   {
        //     id: 929307412003,
        //     content: 'Run for 5 kilometers',
        //     date: 1660329584961,
        //     completed: false,
        //   },
        //   {
        //     id: 162381830310,
        //     content: 'Check emails',
        //     date: 1660329438631,
        //     completed: true,
        //   },
        //   {
        //     id: 325332161656,
        //     content: 'Pay for rent',
        //     date: 1660329420947,
        //     completed: false,
        //   },
        //   {
        //     id: 526919297563,
        //     content: 'Drink a glass of water',
        //     date: 1659808439557,
        //     completed: false,
        //   },
        //   {
        //     id: 552267099247,
        //     content: 'Wash the dishes',
        //     date: 1659808434612,
        //     completed: true,
        //   },
        //   {
        //     id: 393829242937,
        //     content: 'Buy Minecraft Java&Bedrock Edition',
        //     date: 1659808426168,
        //     completed: false,
        //   },
        //   {
        //     id: 864336467614,
        //     content: "Finish Plato's Republic",
        //     date: 1659808404208,
        //     completed: false,
        //   },
        //   {
        //     id: 604908128095,
        //     content: "Finish Sofie's World",
        //     date: 1659808379333,
        //     completed: true,
        //   },
        // ],
        todos: [],
        preferences: {
          theme: 'os' /* light, dark, os */,
          sortType: 'date' /* date, name */,
          showTodos: 'all' /* all, active, completed */,
          sortDesc: false,
          hideBanner: false,
          hideLastDeletedTodoNotifications: false,
          hideSearchBar: false,
          date: 'hide' /* hide, date, time, full */,
        },
        user: {
          firstName: undefined,
        },
      },
      cache: {
        filteredTodos: undefined,
        expandPreferences: false,
        currentContent: '',
        searchContent: '',
        lastDeletedTodo: undefined,
        showLastDeletedTodoNotification: false,
      },
    };
  },
  watch: {
    data: {
      handler(data) {
        localStorage.setItem('data', JSON.stringify(data));
      },
      deep: true,
    },
  },
  computed: {
    /**
     * @returns title in string
     * @description If the user has set a first name for self, the first name will be displayed after "Hello, " in the title of the application, otherwise "Crema To-Do" will be seen in the title.
     */
    personalizedTitle() {
      return this.data.user.firstName
        ? `Hello, ${this.data.user.firstName}`
        : 'Crema To-Do';
    },
    /**
     * @returns all filtered todos or filtered todos matching search results
     * @description If any input is entered in the search bar, todos containing the entered input are displayed, otherwise all filtered todos are displayed.
     */
    filterTodos() {
      if (this.cache.searchContent !== '') {
        return this.cache.filteredTodos.filter(todo =>
          todo.content.toLowerCase().includes(this.cache.searchContent.toLowerCase())
        );
      }

      return this.cache.filteredTodos;
    },
  },
  created() {
    if (localStorage.getItem('data')) {
      let checkObj = JSON.parse(localStorage.getItem('data'));

      switch (checkObj.version) {
        case 2:
          /* v-1.3 and above */
          this.data = checkObj;
          break;
        case 1:
          /* between v-1.1.1 and v-1.2.1 */
          this.data = checkObj;
          this.data.version = 2;
          this.data.user = {};
          checkObj.preferences.hideCompletedTodos
            ? (this.data.preferences.showTodos = 'active')
            : (this.data.preferences.showTodos = 'all');
          break;
        default:
          /* v-1.1.0 and below */
          localStorage.clear();
          break;
      }
    }
    localStorage.setItem('data', JSON.stringify(this.data));
  },
  mounted() {
    switch (this.data.preferences.theme) {
      case 'os':
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? document.querySelector('html').classList.add('dark')
          : document.querySelector('html').classList.remove('dark');
        break;
      case 'light':
        document.querySelector('html').classList.remove('dark');
        break;
      case 'dark':
        document.querySelector('html').classList.add('dark');
        break;
    }

    this.rearrangeTodos();
  },
  methods: {
    /**
     * @param {Number} id - ID property of object in todos array
     * @description - Sets true if the completed property of the selected to-do object is false, false if true.
     */
    toggleStatus(id) {
      this.data.todos.find(todo => todo.id === id).completed = !this.data.todos.find(
        todo => todo.id === id
      ).completed;
    },
    /**
     * @description This method is used to add a todo when the + button or enter is pressed after the user has entered the todo input.
     */
    addTodo() {
      this.cache.currentContent = this.cache.currentContent.trim();
      if (this.cache.currentContent === '') this.cache.currentContent = 'Blank to-do';

      let newTodo = {
        id: Math.round(Math.random() * 1000000000000),
        content: this.cache.currentContent,
        date: Date.now(),
        completed: false,
      };

      this.unshiftOrPushHandler(newTodo);

      this.rearrangeTodos();

      this.cache.currentContent = '';
    },
    /**
     * @param {Number} id - ID property of the todo
     * @description This method is used to delete the related todo when the trash icon is pressed.
     */
    removeTodo(id) {
      [this.cache.lastDeletedTodo] = this.data.todos.splice(
        this.data.todos.findIndex(todo => {
          return todo.id === id;
        }),
        1
      );

      if (!this.data.preferences.hideLastDeletedTodoNotifications) {
        this.cache.showLastDeletedTodoNotification = true;
        clearTimeout(timeout);

        timeout = setTimeout(() => {
          this.cache.showLastDeletedTodoNotification = false;
          this.cache.lastDeletedTodo = undefined;
        }, 7000);
      }

      this.rearrangeTodos();
    },
    /**
     * @description If you deleted any to-do by mistake, you can recover your last to-do.
     */
    recoverTodo() {
      clearTimeout(timeout);
      this.cache.showLastDeletedTodoNotification = false;

      this.unshiftOrPushHandler(this.cache.lastDeletedTodo);

      this.rearrangeTodos();
    },
    /**
     * @param {object} todoObj - Todo object in todos array or this.cache.lastDeletedTodo
     * @description This method is a handler written to avoid duplication of the same code block. It is used in both addTodo and recoverTodo methods.
     */
    unshiftOrPushHandler(todoObj) {
      switch (this.data.preferences.sortType) {
        case 'name':
          this.data.preferences.sortDesc
            ? this.data.todos.push(todoObj)
            : this.data.todos.unshift(todoObj);
          break;
        default:
          /* Including case 'date': */
          this.data.preferences.sortDesc
            ? this.data.todos.unshift(todoObj)
            : this.data.todos.push(todoObj);
          break;
      }
    },
    /**
     * @param {Date} date - Date in milliseconds
     * @returns new Date (localized)
     * @description This method takes the date in milliseconds as a parameter and returns a new localized date, time, or date+time.
     */
    formatDate(date) {
      switch (this.data.preferences.date) {
        case 'date':
          return new Date(date).toLocaleDateString();
        case 'time':
          return new Date(date).toLocaleTimeString();
        case 'full':
          return new Date(date).toLocaleString();
        default:
          return '';
      }
    },
    /**
     * @description - This method is a handler for sorting todos by date/name or ascending/descending.
     */
    rearrangeTodos() {
      switch (this.data.preferences.sortType) {
        case 'name':
          this.data.preferences.sortDesc
            ? this.data.todos.sort((a, b) => b.content.localeCompare(a.content))
            : this.data.todos.sort((a, b) => a.content.localeCompare(b.content));
          break;
        default:
          /* Including case 'date': */
          this.data.preferences.sortDesc
            ? this.data.todos.sort((a, b) => parseFloat(b.date) - parseFloat(a.date))
            : this.data.todos.sort((a, b) => parseFloat(a.date) - parseFloat(b.date));
          break;
      }

      switch (this.data.preferences.showTodos) {
        case 'active':
          this.cache.filteredTodos = this.data.todos.filter(todo => !todo.completed);
          break;
        case 'completed':
          this.cache.filteredTodos = this.data.todos.filter(todo => todo.completed);
          break;
        default:
          /* Including case 'all' */
          this.cache.filteredTodos = this.data.todos;
          break;
      }
    },
  },
  components: {
    CheckSquare,
    Square,
    Pencil,
    Trash,
    PlusCircle,
    SwitchVertical,
    Circle,
    RecordCircle,
    ChevronRight,
    ChevronBottom,
    Banner,
  },
};
</script>

<template>
  <div class="p-6 md:p-12 gap-6 md:gap-12 flex flex-col">
    <div class="w-full flex flex-col gap-3">
      <div>
        <h1 class="text-4xl font-bold dark:text-gray-200">
          {{ personalizedTitle }}
        </h1>
      </div>
      <p v-if="data.todos.length === 0" class="dark:text-gray-300">
        You didn't add any to-do. To create your first to-do, type below then hit enter or
        the + sign.
      </p>
      <div class="w-full flex gap-3 md:gap-6" v-else>
        <div class="w-1/12 flex justify-center"></div>
        <div class="w-10/12 flex justify-end">
          <input
            type="text"
            name="searchTodo"
            id="searchTodo"
            class="rounded px-3 bg-gray-100 dark:bg-gray-700 dark:text-white w-full md:w-auto"
            placeholder="Search todo"
            v-if="!data.preferences.hideSearchBar"
            v-model="cache.searchContent"
          />
        </div>
        <div class="w-1/12 flex gap-3 justify-center">
          <a
            href="#"
            @click.prevent
            @click="
              data.preferences.sortDesc = !data.preferences.sortDesc;
              rearrangeTodos();
            "
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
          >
            <SwitchVertical />
          </a>
        </div>
      </div>
      <div class="w-full flex flex-col gap-3">
        <div
          class="w-full flex gap-3 md:gap-6"
          v-for="todo in filterTodos"
          :key="todo.id"
        >
          <div
            class="w-1/12 flex justify-center"
            :class="
              data.preferences.date !== 'hide' && data.preferences.date ? 'mt-2' : 'mt-0'
            "
          >
            <a
              href="#"
              @click.prevent
              v-if="todo.completed"
              @click="toggleStatus(todo.id)"
              class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
            >
              <CheckSquare />
            </a>
            <a
              href="#"
              @click.prevent
              v-else="todo.completed"
              @click="toggleStatus(todo.id)"
              class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
            >
              <Square />
            </a>
          </div>
          <div class="w-10/12">
            <input
              type="text"
              :name="todo.id"
              :id="todo.id"
              v-model="todo.content"
              class="w-full dark:bg-gray-800 dark:text-gray-300"
              :class="{ 'line-through text-gray-400 dark:text-gray-600': todo.completed }"
            />
            <p
              v-if="data.preferences.date !== 'hide' && data.preferences.date"
              class="text-xs text-gray-800 dark:text-gray-400"
              :class="{ 'text-gray-300 dark:text-gray-700': todo.completed }"
            >
              {{ formatDate(todo.date) }}
            </p>
          </div>
          <div
            class="w-1/12 flex gap-3 justify-center"
            :class="
              data.preferences.date !== 'hide' && data.preferences.date ? 'mt-2' : 'mt-0'
            "
          >
            <a
              href="#"
              @click.prevent
              @click="removeTodo(todo.id)"
              class="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200"
            >
              <Trash />
            </a>
          </div>
        </div>
      </div>

      <div class="w-full flex gap-3 md:gap-6">
        <div class="w-1/12 flex justify-center"></div>
        <div class="w-10/12">
          <input
            type="text"
            name="todoContent"
            id="todoContent"
            class="rounded w-full bg-gray-100 dark:bg-gray-700 dark:text-white px-3"
            v-model="cache.currentContent"
            v-on:keyup.enter="addTodo"
            placeholder="Add new todo from here..."
          />
        </div>
        <div class="w-1/12 flex gap-3 justify-center">
          <a
            href="#"
            @click.prevent
            @click="addTodo"
            class="text-gray-700 dark:text-gray-200 hover:text-green-700 dark:hover:text-green-200 transition-all duration-200"
          >
            <PlusCircle />
          </a>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-6">
      <a
        href="#"
        @click.prevent
        @click="cache.expandPreferences = !cache.expandPreferences"
      >
        <h2
          class="text-md text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3"
        >
          <ChevronBottom v-if="cache.expandPreferences" />
          <ChevronRight v-else /> Preferences
        </h2>
      </a>
      <div class="flex flex-col gap-6" v-if="cache.expandPreferences">
        <div class="flex gap-6">
          <p class="dark:text-gray-400 text-sm">First name:</p>
          <input
            type="text"
            name="firstName"
            id="firstName"
            class="rounded bg-gray-100 dark:bg-gray-700 dark:text-white px-3"
            placeholder="Your first name"
            v-model.trim="data.user.firstName"
          />
        </div>
        <p class="dark:text-gray-400 text-sm">Theme:</p>
        <div class="flex gap-6">
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="data.preferences.theme = 'os'"
          >
            <RecordCircle
              v-if="
                data.preferences.theme === 'os' || data.preferences.theme === undefined
              "
            />
            <Circle v-else />
            <p>System</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="data.preferences.theme = 'light'"
          >
            <RecordCircle v-if="data.preferences.theme === 'light'" />
            <Circle v-else />
            <p>Light</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="data.preferences.theme = 'dark'"
          >
            <RecordCircle v-if="data.preferences.theme === 'dark'" />
            <Circle v-else />
            <p>Dark</p>
          </a>
        </div>
        <p class="dark:text-gray-400 text-sm">
          NOTE: After changing the theme, you need to refresh the page.
        </p>
        <a
          href="#"
          @click.prevent
          class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
          @click="data.preferences.hideBanner = !data.preferences.hideBanner"
        >
          <CheckSquare v-if="data.preferences.hideBanner" height="20" width="20" />
          <Square v-else height="20" width="20" />
          <p>Hide "Created by" banner</p>
        </a>
        <a
          href="#"
          @click.prevent
          class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
          @click="data.preferences.hideSearchBar = !this.data.preferences.hideSearchBar"
        >
          <CheckSquare v-if="data.preferences.hideSearchBar" height="20" width="20" />
          <Square v-else height="20" width="20" />
          <p>Hide search bar</p>
        </a>
        <a
          href="#"
          @click.prevent
          class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
          @click="
            data.preferences.hideLastDeletedTodoNotifications =
              !data.preferences.hideLastDeletedTodoNotifications
          "
        >
          <!-- prettier-ignore -->
          <CheckSquare v-if="data.preferences.hideLastDeletedTodoNotifications" height="20" width="20" />
          <Square v-else height="20" width="20" />
          <p>Hide "Deleted to-do." notifications</p>
        </a>
        <p class="dark:text-gray-400 text-sm">
          NOTE: If you hide "Deleted to-do." notifications and delete any to-do by
          mistake, you won't be able to recover your last to-do.
        </p>
        <p class="dark:text-gray-400 text-sm">Date/Time:</p>
        <div class="flex gap-6">
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="data.preferences.date = 'hide'"
          >
            <RecordCircle
              v-if="
                data.preferences.date === 'hide' || data.preferences.date === undefined
              "
            />
            <Circle v-else />
            <p>Hide</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="data.preferences.date = 'date'"
          >
            <RecordCircle v-if="data.preferences.date === 'date'" />
            <Circle v-else />
            <p>Date</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="data.preferences.date = 'time'"
          >
            <RecordCircle v-if="data.preferences.date === 'time'" />
            <Circle v-else />
            <p>Time</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="data.preferences.date = 'full'"
          >
            <RecordCircle v-if="data.preferences.date === 'full'" />
            <Circle v-else />
            <p>Full</p>
          </a>
        </div>
        <p class="dark:text-gray-400 text-sm">Sort type:</p>
        <div class="flex gap-6">
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="
              data.preferences.sortType = 'date';
              rearrangeTodos();
            "
          >
            <RecordCircle
              v-if="
                data.preferences.sortType === 'date' ||
                data.preferences.sortType === undefined
              "
            />
            <Circle v-else />
            <p>Date</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="
              data.preferences.sortType = 'name';
              rearrangeTodos();
            "
          >
            <RecordCircle v-if="data.preferences.sortType === 'name'" />
            <Circle v-else />
            <p>Name</p>
          </a>
        </div>
        <p class="dark:text-gray-400 text-sm">Show todos:</p>
        <div class="flex gap-6">
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="
              data.preferences.showTodos = 'all';
              rearrangeTodos();
            "
          >
            <RecordCircle
              v-if="
                data.preferences.showTodos === 'all' ||
                data.preferences.showTodos === undefined
              "
            />
            <Circle v-else />
            <p>All</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="
              data.preferences.showTodos = 'active';
              rearrangeTodos();
            "
          >
            <RecordCircle v-if="data.preferences.showTodos === 'active'" />
            <Circle v-else />
            <p>Active</p>
          </a>
          <a
            href="#"
            @click.prevent
            class="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 flex gap-3 text-sm"
            @click="
              data.preferences.showTodos = 'completed';
              rearrangeTodos();
            "
          >
            <RecordCircle v-if="data.preferences.showTodos === 'completed'" />
            <Circle v-else />
            <p>Completed</p>
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-4"></div>
  <Banner v-if="!data.preferences.hideBanner" />
  <div
    v-if="cache.showLastDeletedTodoNotification"
    class="absolute flex justify-between content-center bottom-8 left-3 right-3 md:left-1/3 md:right-1/3 bg-red-300 px-5 py-3 rounded"
  >
    <p class="inline-block py-1">Deleted to-do.</p>
    <div class="flex gap-3">
      <button @click="recoverTodo" class="bg-white rounded px-2 py-1">UNDO</button>
      <a
        href="#"
        @click.prevent
        class="px-2 py-1 font-bold"
        @click="
          cache.showLastDeletedTodoNotification = false;
          cache.lastDeletedTodo = undefined;
        "
        >&#9587;</a
      >
    </div>
  </div>
</template>

<style scoped></style>
